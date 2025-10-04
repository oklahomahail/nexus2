// src/services/predictiveAnalyticsService.ts

import type { Donor } from "@/models/donors";
import type {
  PredictionModel,
  DonorPrediction,
  TrainingDataSet,
  PredictionType,
} from "@/models/segmentation";
import { logger } from "@/utils/logger";

// Machine Learning Interfaces
export interface MLModelConfig {
  type: PredictionType;
  algorithm:
    | "linear_regression"
    | "random_forest"
    | "gradient_boosting"
    | "neural_network"
    | "logistic_regression";
  features: string[];
  hyperparameters: Record<string, any>;
  validationSplit: number; // 0-1, percentage for validation
  crossValidation: boolean;
  featureSelection: boolean;
  regularization?: {
    type: "l1" | "l2" | "elastic_net";
    strength: number;
  };
}

export interface ModelTrainingResult {
  model: PredictionModel;
  metrics: {
    training: Record<string, number>;
    validation: Record<string, number>;
    crossValidation?: Record<string, number>;
  };
  featureImportance: Array<{
    ___featureName: string;
    importance: number;
    rank: number;
  }>;
  convergence: {
    converged: boolean;
    iterations: number;
    finalLoss: number;
  };
}

export interface PredictionRequest {
  donorId: string;
  features: Record<string, any>;
  models: string[]; // model IDs to use
  ensemble?: boolean; // combine predictions from multiple models
}

export interface EnsemblePrediction {
  donorId: string;
  predictions: DonorPrediction[];
  ensembleResult: {
    value: any;
    confidence: number;
    method: "average" | "weighted" | "voting";
  };
  modelContributions: Array<{
    modelId: string;
    weight: number;
    prediction: any;
    confidence: number;
  }>;
}

export interface ModelPerformanceReport {
  modelId: string;
  performance: {
    overall: Record<string, number>;
    bySegment: Array<{
      segmentId: string;
      metrics: Record<string, number>;
    }>;
    byTimeWindow: Array<{
      period: string;
      metrics: Record<string, number>;
    }>;
  };
  recommendations: Array<{
    type: "retraining" | "feature_engineering" | "hyperparameter_tuning";
    priority: "low" | "medium" | "high";
    description: string;
    expectedImprovement: number;
  }>;
  alerts: Array<{
    type: "performance_degradation" | "data_drift" | "concept_drift";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    actionRequired: boolean;
  }>;
}

class PredictiveAnalyticsService {
  private static instance: PredictiveAnalyticsService;
  private models: Map<string, PredictionModel> = new Map();
  private trainingDataSets: Map<string, TrainingDataSet> = new Map();
  private predictionCache: Map<string, DonorPrediction[]> = new Map(); // donorId -> predictions
  private modelPerformance: Map<string, ModelPerformanceReport> = new Map();

  private constructor() {
    this.initializeDefaultModels();
    this.startModelMonitoring();
    logger.info("Predictive Analytics Service initialized");
  }

  static getInstance(): PredictiveAnalyticsService {
    if (!PredictiveAnalyticsService.instance) {
      PredictiveAnalyticsService.instance = new PredictiveAnalyticsService();
    }
    return PredictiveAnalyticsService.instance;
  }

  // ============================================================================
  // MODEL TRAINING & MANAGEMENT
  // ============================================================================

  async trainModel(
    config: MLModelConfig,
    trainingData: TrainingDataSet,
  ): Promise<ModelTrainingResult> {
    logger.info(`Training ${config.type} model using ${config.algorithm}`, {
      features: config.features,
      sampleSize: trainingData.samples.length,
    });

    // Validate training data
    this.validateTrainingData(trainingData, config.features);

    // Prepare features and targets
    const { features, targets } = this.prepareTrainingData(
      trainingData,
      config.features,
    );

    // Split data for training and validation
    const splitIndex = Math.floor(
      features.length * (1 - config.validationSplit),
    );
    const trainFeatures = features.slice(0, splitIndex);
    const trainTargets = targets.slice(0, splitIndex);
    const valFeatures = features.slice(splitIndex);
    const valTargets = targets.slice(splitIndex);

    // Train the model based on algorithm
    const modelResult = await this.executeTraining(
      config,
      trainFeatures,
      trainTargets,
      valFeatures,
      valTargets,
    );

    // Create model object
    const model: PredictionModel = {
      id: `model_${config.type}_${Date.now()}`,
      name: `${config.type.replace("_", " ")} Model`,
      type: config.type,
      algorithm: config.algorithm,
      features: config.features,
      performance: modelResult.metrics.validation,
      trainingData: {
        sampleSize: trainingData.samples.length,
        dateRange: trainingData.metadata.dateRange,
        featureImportance: modelResult.featureImportance.reduce(
          (obj, item) => {
            obj[item.___featureName] = item.importance;
            return obj;
          },
          {} as Record<string, number>,
        ),
      },
      status: "active",
      lastTrainedAt: new Date(),
      nextTrainingDue: this.calculateNextTrainingDate(),
      version: "1.0.0",
    };

    // Store the model
    this.models.set(model.id, model);

    logger.info(`Model ${model.id} trained successfully`, {
      performance: model.performance,
      features: model.features.length,
    });

    return {
      model,
      metrics: modelResult.metrics,
      featureImportance: modelResult.featureImportance,
      convergence: modelResult.convergence,
    };
  }

  private validateTrainingData(
    trainingData: TrainingDataSet,
    requiredFeatures: string[],
  ): void {
    if (trainingData.samples.length === 0) {
      throw new Error("Training data cannot be empty");
    }

    // Check if all required features are present
    const sampleFeatures = Object.keys(trainingData.samples[0].features);
    const missingFeatures = requiredFeatures.filter(
      (f) => !sampleFeatures.includes(f),
    );

    if (missingFeatures.length > 0) {
      throw new Error(
        `Missing required features: ${missingFeatures.join(", ")}`,
      );
    }

    // Check data quality
    const completeness = this.calculateDataCompleteness(trainingData);
    if (completeness < 0.8) {
      logger.warn(
        `Training data completeness is low: ${(completeness * 100).toFixed(1)}%`,
      );
    }
  }

  private calculateDataCompleteness(trainingData: TrainingDataSet): number {
    let totalFields = 0;
    let completeFields = 0;

    trainingData.samples.forEach((sample) => {
      Object.values(sample.features).forEach((value) => {
        totalFields++;
        if (value !== null && value !== undefined && value !== "") {
          completeFields++;
        }
      });
    });

    return totalFields > 0 ? completeFields / totalFields : 0;
  }

  private prepareTrainingData(
    trainingData: TrainingDataSet,
    features: string[],
  ): { features: number[][]; targets: any[] } {
    const featureVectors: number[][] = [];
    const targets: any[] = [];

    trainingData.samples.forEach((sample) => {
      const featureVector = features.map((feature) => {
        const value = sample.features[feature];
        return this.preprocessFeatureValue(value, feature);
      });

      featureVectors.push(featureVector);
      targets.push(sample.target);
    });

    return { features: featureVectors, targets };
  }

  private preprocessFeatureValue(value: any, featureName: string): number {
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string") {
      // Handle categorical variables
      return this.encodeCategorical(value, featureName);
    }
    if (value instanceof Date) {
      return value.getTime();
    }
    return 0; // Default for null/undefined
  }

  private encodeCategorical(value: string, featureName: string): number {
    // Simple hash-based encoding for categorical variables
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000; // Normalize to 0-999 range
  }

  private async executeTraining(
    config: MLModelConfig,
    _trainFeatures: number[][],
    _trainTargets: number[],
    _valFeatures: number[][],
    _valTargets: number[],
  ): Promise<{
    metrics: {
      training: Record<string, number>;
      validation: Record<string, number>;
    };
    featureImportance: Array<{
      ___featureName: string;
      importance: number;
      rank: number;
    }>;
    convergence: { converged: boolean; iterations: number; finalLoss: number };
  }> {
    // Simulate training process with different algorithms
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate training time

    let trainingMetrics: Record<string, number> = {};
    let validationMetrics: Record<string, number> = {};

    switch (config.algorithm) {
      case "linear_regression":
        trainingMetrics = this.simulateRegressionMetrics("training");
        validationMetrics = this.simulateRegressionMetrics("validation");
        break;
      case "logistic_regression":
        trainingMetrics = this.simulateClassificationMetrics("training");
        validationMetrics = this.simulateClassificationMetrics("validation");
        break;
      case "random_forest":
        trainingMetrics =
          config.type.includes("amount") || config.type.includes("value")
            ? this.simulateRegressionMetrics("training")
            : this.simulateClassificationMetrics("training");
        validationMetrics =
          config.type.includes("amount") || config.type.includes("value")
            ? this.simulateRegressionMetrics("validation")
            : this.simulateClassificationMetrics("validation");
        break;
      default:
        trainingMetrics = this.simulateRegressionMetrics("training");
        validationMetrics = this.simulateRegressionMetrics("validation");
    }

    // Generate feature importance
    const featureImportance = config.features
      .map((feature, index) => ({
        ___featureName: feature,
        importance: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
        rank: index + 1,
      }))
      .sort((a, b) => b.importance - a.importance)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    // Simulate convergence
    const convergence = {
      converged: Math.random() > 0.1, // 90% chance of convergence
      iterations: Math.floor(Math.random() * 100) + 50,
      finalLoss: Math.random() * 0.05 + 0.001,
    };

    return {
      metrics: { training: trainingMetrics, validation: validationMetrics },
      featureImportance,
      convergence,
    };
  }

  private simulateRegressionMetrics(type: string): Record<string, number> {
    const baseVariance = type === "training" ? 0.02 : 0.05;
    return {
      rmse: Math.random() * baseVariance + 0.1,
      mae: Math.random() * baseVariance + 0.08,
      r2Score: Math.random() * 0.3 + 0.7,
      mape: Math.random() * 10 + 5, // 5-15%
    };
  }

  private simulateClassificationMetrics(type: string): Record<string, number> {
    const baseVariance = type === "training" ? 0.05 : 0.08;
    const accuracy = Math.random() * baseVariance + 0.85;
    return {
      accuracy,
      precision: accuracy + Math.random() * 0.05 - 0.025,
      recall: accuracy + Math.random() * 0.05 - 0.025,
      f1Score: accuracy + Math.random() * 0.03 - 0.015,
      auc: accuracy + Math.random() * 0.1 - 0.05,
    };
  }

  private calculateNextTrainingDate(): Date {
    const nextTraining = new Date();
    nextTraining.setMonth(nextTraining.getMonth() + 3); // Retrain every 3 months
    return nextTraining;
  }

  // ============================================================================
  // PREDICTION GENERATION
  // ============================================================================

  async generatePredictions(
    request: PredictionRequest,
  ): Promise<DonorPrediction[]> {
    logger.info(`Generating predictions for donor ${request.donorId}`, {
      models: request.models,
      ensemble: request.ensemble,
    });

    const predictions: DonorPrediction[] = [];

    for (const modelId of request.models) {
      const model = this.models.get(modelId);
      if (!model || model.status !== "active") {
        logger.warn(`Model ${modelId} not found or inactive`);
        continue;
      }

      const prediction = await this.makePrediction(
        model,
        request.donorId,
        request.features,
      );
      predictions.push(prediction);
    }

    // Cache predictions
    this.predictionCache.set(request.donorId, predictions);

    logger.info(
      `Generated ${predictions.length} predictions for donor ${request.donorId}`,
    );
    return predictions;
  }

  private async makePrediction(
    model: PredictionModel,
    donorId: string,
    features: Record<string, any>,
  ): Promise<DonorPrediction> {
    // Extract and preprocess features
    const featureVector = model.features.map((feature) =>
      this.preprocessFeatureValue(features[feature], feature),
    );

    // Simulate prediction based on model type
    const prediction = this.simulatePrediction(model, featureVector);
    const confidence = this.calculatePredictionConfidence(
      model,
      featureVector,
      prediction,
    );
    const reasoning = this.generatePredictionReasoning(
      model,
      features,
      prediction,
    );
    const factors = this.identifyInfluencingFactors(model, features);

    return {
      donorId,
      modelId: model.id,
      type: model.type,
      prediction,
      confidence,
      reasoning,
      factors,
      generatedAt: new Date(),
      validUntil: this.calculatePredictionExpiry(model.type),
    };
  }

  private simulatePrediction(
    model: PredictionModel,
    featureVector: number[],
  ): any {
    const random = Math.random();

    switch (model.type) {
      case "lifetime_value":
        // Simulate LTV prediction (in dollars)
        return Math.floor(random * 5000 + 500); // $500 - $5,500

      case "churn_risk":
        // Simulate churn probability (0-1)
        return Math.random() * 0.8 + 0.1; // 10% - 90%

      case "next_donation_amount": {
        // Simulate next donation amount
        const avgFeature =
          featureVector.length > 0
            ? featureVector.reduce((a, b) => a + b, 0) / featureVector.length
            : 100;
        return Math.floor(avgFeature * (random * 0.5 + 0.75)); // 75-125% of average feature
      }

      case "next_donation_timing":
        // Simulate days until next donation
        return Math.floor(random * 180 + 30); // 30-210 days

      case "campaign_response_likelihood":
        // Simulate response probability
        return Math.random() * 0.6 + 0.1; // 10% - 70%

      case "upgrade_probability":
        // Simulate upgrade probability
        return Math.random() * 0.4 + 0.1; // 10% - 50%

      default:
        return random;
    }
  }

  private calculatePredictionConfidence(
    model: PredictionModel,
    featureVector: number[],
    ___prediction: any,
  ): number {
    // Base confidence on model performance and feature completeness
    let confidence = 0.5;

    // Factor in model performance
    if (model.performance.accuracy)
      confidence += model.performance.accuracy * 0.3;
    if (model.performance.r2Score)
      confidence += model.performance.r2Score * 0.3;

    // Factor in feature completeness
    const featureCompleteness =
      featureVector.filter((v) => v !== 0).length / featureVector.length;
    confidence += featureCompleteness * 0.2;

    // Factor in model age (newer models may be more accurate)
    const daysSinceTraining =
      (Date.now() - model.lastTrainedAt.getTime()) / (1000 * 60 * 60 * 24);
    const ageFactor = Math.max(0, 1 - daysSinceTraining / 90); // Confidence decreases over 90 days
    confidence *= 0.7 + ageFactor * 0.3;

    return Math.min(Math.max(confidence, 0.1), 0.95); // Clamp between 10% and 95%
  }

  private generatePredictionReasoning(
    model: PredictionModel,
    features: Record<string, any>,
    ___prediction: any,
  ): string[] {
    const reasoning: string[] = [];

    // Get top contributing features
    const topFeatures = Object.entries(model.trainingData.featureImportance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    topFeatures.forEach(([feature, importance]) => {
      const value = features[feature];
      if (value !== undefined && value !== null) {
        reasoning.push(
          `${feature.replace("_", " ")} (${value}) is a key factor with ${(importance * 100).toFixed(1)}% importance`,
        );
      }
    });

    // Add model-specific reasoning
    switch (model.type) {
      case "lifetime_value":
        reasoning.push(
          "Calculation based on donation history, engagement patterns, and demographic factors",
        );
        break;
      case "churn_risk":
        reasoning.push(
          "Risk assessment considers recency, frequency, and engagement trends",
        );
        break;
      case "next_donation_amount":
        reasoning.push(
          "Prediction based on historical giving patterns and similar donor profiles",
        );
        break;
    }

    return reasoning;
  }

  private identifyInfluencingFactors(
    model: PredictionModel,
    features: Record<string, any>,
  ): Array<{ feature: string; impact: number; value: any }> {
    const factors: Array<{ feature: string; impact: number; value: any }> = [];

    // Get feature importance and create factors
    Object.entries(model.trainingData.featureImportance).forEach(
      ([feature, importance]) => {
        const value = features[feature];
        if (value !== undefined && value !== null) {
          // Simulate impact direction (-1 to 1)
          const impact = (Math.random() * 2 - 1) * importance;

          factors.push({
            feature: feature.replace("_", " "),
            impact,
            value,
          });
        }
      },
    );

    // Sort by absolute impact
    return factors
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 5);
  }

  private calculatePredictionExpiry(predictionType: PredictionType): Date {
    const expiry = new Date();

    switch (predictionType) {
      case "churn_risk":
        expiry.setDate(expiry.getDate() + 30); // Valid for 30 days
        break;
      case "next_donation_timing":
        expiry.setDate(expiry.getDate() + 14); // Valid for 2 weeks
        break;
      case "campaign_response_likelihood":
        expiry.setDate(expiry.getDate() + 7); // Valid for 1 week
        break;
      default:
        expiry.setDate(expiry.getDate() + 60); // Default 60 days
    }

    return expiry;
  }

  // ============================================================================
  // ENSEMBLE PREDICTIONS
  // ============================================================================

  async generateEnsemblePrediction(
    donorId: string,
    predictionType: PredictionType,
    features: Record<string, any>,
  ): Promise<EnsemblePrediction> {
    // Find all models of the requested type
    const relevantModels = Array.from(this.models.values()).filter(
      (model) => model.type === predictionType && model.status === "active",
    );

    if (relevantModels.length < 2) {
      throw new Error(
        `Need at least 2 models for ensemble prediction. Found ${relevantModels.length}`,
      );
    }

    // Generate predictions from all relevant models
    const predictions: DonorPrediction[] = [];
    for (const model of relevantModels) {
      const prediction = await this.makePrediction(model, donorId, features);
      predictions.push(prediction);
    }

    // Calculate ensemble result
    const ensembleResult = this.combineEnsemblePredictions(predictions);

    // Calculate model contributions
    const modelContributions = predictions.map((prediction) => ({
      modelId: prediction.modelId,
      weight: this.calculateModelWeight(prediction.modelId, predictions),
      prediction: prediction.prediction,
      confidence: prediction.confidence,
    }));

    logger.info(`Generated ensemble prediction for donor ${donorId}`, {
      modelsUsed: predictions.length,
      ensembleConfidence: ensembleResult.confidence,
    });

    return {
      donorId,
      predictions,
      ensembleResult,
      modelContributions,
    };
  }

  private combineEnsemblePredictions(predictions: DonorPrediction[]): {
    value: any;
    confidence: number;
    method: "average" | "weighted" | "voting";
  } {
    if (predictions.length === 0) {
      throw new Error("No predictions to combine");
    }

    const predictionType = predictions[0].type;

    // For regression tasks (amounts, values, timing)
    if (
      [
        "lifetime_value",
        "next_donation_amount",
        "next_donation_timing",
      ].includes(predictionType)
    ) {
      // Use weighted average
      let weightedSum = 0;
      let totalWeight = 0;

      predictions.forEach((prediction) => {
        const weight = prediction.confidence;
        weightedSum += Number(prediction.prediction) * weight;
        totalWeight += weight;
      });

      const averageValue = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const averageConfidence = totalWeight / predictions.length;

      return {
        value: Math.round(averageValue),
        confidence: averageConfidence,
        method: "weighted",
      };
    }
    // For classification tasks (probabilities, risks)
    else {
      // Use weighted average for probabilities
      let weightedSum = 0;
      let totalWeight = 0;

      predictions.forEach((prediction) => {
        const weight = prediction.confidence;
        weightedSum += Number(prediction.prediction) * weight;
        totalWeight += weight;
      });

      const averageValue = totalWeight > 0 ? weightedSum / totalWeight : 0;
      const averageConfidence = totalWeight / predictions.length;

      return {
        value: Math.round(averageValue * 1000) / 1000, // Round to 3 decimal places
        confidence: averageConfidence,
        method: "weighted",
      };
    }
  }

  private calculateModelWeight(
    modelId: string,
    ___predictions: DonorPrediction[],
  ): number {
    const model = this.models.get(modelId);
    if (!model) return 0;

    // Weight based on model performance and age
    let weight = 0.5; // Base weight

    // Add performance-based weight
    if (model.performance.accuracy) weight += model.performance.accuracy * 0.3;
    if (model.performance.r2Score) weight += model.performance.r2Score * 0.3;

    // Reduce weight for older models
    const daysSinceTraining =
      (Date.now() - model.lastTrainedAt.getTime()) / (1000 * 60 * 60 * 24);
    const agePenalty = Math.min(daysSinceTraining / 180, 0.3); // Max 30% penalty after 6 months
    weight *= 1 - agePenalty;

    return Math.max(weight, 0.1); // Minimum weight of 10%
  }

  // ============================================================================
  // SPECIFIC PREDICTION METHODS
  // ============================================================================

  async predictLifetimeValue(donor: Donor): Promise<DonorPrediction | null> {
    const models = Array.from(this.models.values()).filter(
      (model) => model.type === "lifetime_value" && model.status === "active",
    );

    if (models.length === 0) {
      logger.warn("No lifetime value prediction models available");
      return null;
    }

    // Use the most recent model
    const model = models.sort(
      (a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime(),
    )[0];

    const features = this.extractDonorFeatures(donor);
    return this.makePrediction(model, donor.id, features);
  }

  async predictChurnRisk(donor: Donor): Promise<DonorPrediction | null> {
    const models = Array.from(this.models.values()).filter(
      (model) => model.type === "churn_risk" && model.status === "active",
    );

    if (models.length === 0) {
      logger.warn("No churn risk prediction models available");
      return null;
    }

    const model = models.sort(
      (a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime(),
    )[0];
    const features = this.extractDonorFeatures(donor);

    return this.makePrediction(model, donor.id, features);
  }

  async predictOptimalAskAmount(donor: Donor): Promise<DonorPrediction | null> {
    const models = Array.from(this.models.values()).filter(
      (model) =>
        model.type === "next_donation_amount" && model.status === "active",
    );

    if (models.length === 0) {
      logger.warn("No donation amount prediction models available");
      return null;
    }

    const model = models.sort(
      (a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime(),
    )[0];
    const features = this.extractDonorFeatures(donor);

    return this.makePrediction(model, donor.id, features);
  }

  async predictContactTiming(donor: Donor): Promise<DonorPrediction | null> {
    const models = Array.from(this.models.values()).filter(
      (model) =>
        model.type === "next_donation_timing" && model.status === "active",
    );

    if (models.length === 0) {
      logger.warn("No donation timing prediction models available");
      return null;
    }

    const model = models.sort(
      (a, b) => b.lastTrainedAt.getTime() - a.lastTrainedAt.getTime(),
    )[0];
    const features = this.extractDonorFeatures(donor);

    return this.makePrediction(model, donor.id, features);
  }

  private extractDonorFeatures(donor: Donor): Record<string, any> {
    const donations = donor.donations || [];
    const now = new Date();

    // Calculate derived features
    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = donations.length;
    const avgDonationAmount =
      donationCount > 0 ? totalDonated / donationCount : 0;
    const maxDonationAmount =
      donationCount > 0 ? Math.max(...donations.map((d) => d.amount)) : 0;

    const daysSinceFirstDonation =
      donationCount > 0
        ? Math.floor(
            (now.getTime() -
              Math.min(...donations.map((d) => d.date.getTime()))) /
              (1000 * 60 * 60 * 24),
          )
        : 0;

    const daysSinceLastDonation =
      donationCount > 0
        ? Math.floor(
            (now.getTime() -
              Math.max(...donations.map((d) => d.date.getTime()))) /
              (1000 * 60 * 60 * 24),
          )
        : 9999;

    // Calculate donation frequency (donations per year)
    const donationFrequency =
      daysSinceFirstDonation > 0
        ? (donationCount * 365) / daysSinceFirstDonation
        : 0;

    // Calculate recent activity (last 90 days)
    const recentDonations = donations.filter(
      (d) => now.getTime() - d.date.getTime() < 90 * 24 * 60 * 60 * 1000,
    );
    const recentDonationCount = recentDonations.length;
    const recentTotalAmount = recentDonations.reduce(
      (sum, d) => sum + d.amount,
      0,
    );

    return {
      // Basic demographics
      age: donor.age || 45,

      // Donation history features
      total_donated: totalDonated,
      donation_count: donationCount,
      avg_donation_amount: avgDonationAmount,
      max_donation_amount: maxDonationAmount,
      days_since_first_donation: daysSinceFirstDonation,
      days_since_last_donation: daysSinceLastDonation,
      donation_frequency: donationFrequency,

      // Recent activity features
      recent_donation_count: recentDonationCount,
      recent_total_amount: recentTotalAmount,
      recent_avg_amount:
        recentDonationCount > 0 ? recentTotalAmount / recentDonationCount : 0,

      // Engagement features (mock values)
      engagement_score: Math.random() * 100,
      email_open_rate: Math.random() * 0.5 + 0.2, // 20-70%
      campaign_response_rate: Math.random() * 0.3 + 0.05, // 5-35%

      // Temporal features
      months_as_donor: Math.floor(daysSinceFirstDonation / 30),
      season: Math.floor(now.getMonth() / 3), // 0=Winter, 1=Spring, 2=Summer, 3=Fall
      day_of_week: now.getDay(),

      // Calculated ratios
      donation_growth_trend: this.calculateGrowthTrend(donations),
      consistency_score: this.calculateConsistencyScore(donations),
    };
  }

  private calculateGrowthTrend(donations: any[]): number {
    if (donations.length < 2) return 0;

    const sorted = donations.sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstHalfAvg =
      firstHalf.reduce((sum, d) => sum + d.amount, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, d) => sum + d.amount, 0) / secondHalf.length;

    return firstHalfAvg > 0 ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg : 0;
  }

  private calculateConsistencyScore(donations: any[]): number {
    if (donations.length < 2) return 0;

    const amounts = donations.map((d) => d.amount);
    const mean =
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) /
      amounts.length;
    const standardDeviation = Math.sqrt(variance);

    // Coefficient of variation (lower = more consistent)
    const cv = mean > 0 ? standardDeviation / mean : 1;
    return Math.max(0, 1 - cv); // Convert to consistency score (higher = more consistent)
  }

  // ============================================================================
  // MODEL PERFORMANCE MONITORING
  // ============================================================================

  async evaluateModelPerformance(
    modelId: string,
  ): Promise<ModelPerformanceReport> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    logger.info(`Evaluating performance for model ${modelId}`);

    // Simulate performance evaluation
    const report: ModelPerformanceReport = {
      modelId,
      performance: {
        overall: this.generatePerformanceMetrics(model),
        bySegment: this.generateSegmentPerformance(model),
        byTimeWindow: this.generateTimeWindowPerformance(model),
      },
      recommendations: this.generateModelRecommendations(model),
      alerts: this.generatePerformanceAlerts(model),
    };

    this.modelPerformance.set(modelId, report);

    logger.info(`Performance evaluation complete for model ${modelId}`, {
      overallScore:
        report.performance.overall.accuracy ||
        report.performance.overall.r2Score,
      recommendations: report.recommendations.length,
      alerts: report.alerts.length,
    });

    return report;
  }

  private generatePerformanceMetrics(
    ___model: PredictionModel,
  ): Record<string, number> {
    // Simulate current performance vs. original training performance
    const degradationFactor = Math.random() * 0.1 + 0.9; // 10% max degradation

    const metrics: Record<string, number> = {};
    Object.entries(___model.performance).forEach(([metric, value]) => {
      metrics[metric] = value * degradationFactor;
    });

    // Add additional monitoring metrics
    metrics.prediction_count = Math.floor(Math.random() * 1000) + 500;
    metrics.average_confidence = Math.random() * 0.2 + 0.7;
    metrics.data_drift_score = Math.random() * 0.3; // 0 = no drift, 1 = complete drift

    return metrics;
  }

  private generateSegmentPerformance(model: PredictionModel): Array<{
    segmentId: string;
    metrics: Record<string, number>;
  }> {
    // Simulate performance across different donor segments
    const segments = ["high_value", "regular", "lapsed", "new"];

    return segments.map((segmentId) => ({
      segmentId,
      metrics: {
        accuracy: Math.random() * 0.2 + 0.7,
        precision: Math.random() * 0.2 + 0.7,
        recall: Math.random() * 0.2 + 0.7,
        sample_size: Math.floor(Math.random() * 200) + 50,
      },
    }));
  }

  private generateTimeWindowPerformance(model: PredictionModel): Array<{
    period: string;
    metrics: Record<string, number>;
  }> {
    // Simulate performance over time
    const periods = ["last_week", "last_month", "last_quarter"];

    return periods.map((period) => ({
      period,
      metrics: {
        accuracy: Math.random() * 0.15 + 0.75,
        prediction_volume: Math.floor(Math.random() * 500) + 100,
        average_confidence: Math.random() * 0.2 + 0.7,
      },
    }));
  }

  private generateModelRecommendations(model: PredictionModel): Array<{
    type: "retraining" | "feature_engineering" | "hyperparameter_tuning";
    priority: "low" | "medium" | "high";
    description: string;
    expectedImprovement: number;
  }> {
    const recommendations = [];

    // Check if retraining is needed
    const daysSinceTraining =
      (Date.now() - model.lastTrainedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceTraining > 90) {
      recommendations.push({
        type: "retraining" as const,
        priority:
          daysSinceTraining > 180 ? ("high" as const) : ("medium" as const),
        description: `Model hasn't been retrained in ${Math.floor(daysSinceTraining)} days`,
        expectedImprovement: 0.05 + Math.random() * 0.1,
      });
    }

    // Random additional recommendations
    if (Math.random() > 0.7) {
      recommendations.push({
        type: "feature_engineering" as const,
        priority: "medium" as const,
        description:
          "Consider adding new behavioral features for improved accuracy",
        expectedImprovement: Math.random() * 0.08,
      });
    }

    if (Math.random() > 0.8) {
      recommendations.push({
        type: "hyperparameter_tuning" as const,
        priority: "low" as const,
        description: "Hyperparameter optimization could improve performance",
        expectedImprovement: Math.random() * 0.03,
      });
    }

    return recommendations;
  }

  private generatePerformanceAlerts(model: PredictionModel): Array<{
    type: "performance_degradation" | "data_drift" | "concept_drift";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    actionRequired: boolean;
  }> {
    const alerts = [];

    // Check for performance degradation
    const currentPerformance = Math.random() * 0.9 + 0.1;
    const originalPerformance =
      model.performance.accuracy || model.performance.r2Score || 0.8;
    const degradation =
      (originalPerformance - currentPerformance) / originalPerformance;

    if (degradation > 0.1) {
      alerts.push({
        type: "performance_degradation" as const,
        severity: degradation > 0.2 ? ("high" as const) : ("medium" as const),
        message: `Model performance has degraded by ${(degradation * 100).toFixed(1)}%`,
        actionRequired: degradation > 0.15,
      });
    }

    // Check for data drift
    const driftScore = Math.random();
    if (driftScore > 0.6) {
      alerts.push({
        type: "data_drift" as const,
        severity: driftScore > 0.8 ? ("high" as const) : ("medium" as const),
        message: `Significant data drift detected (score: ${driftScore.toFixed(2)})`,
        actionRequired: driftScore > 0.75,
      });
    }

    return alerts;
  }

  private startModelMonitoring(): void {
    // Monitor model performance every hour
    setInterval(async () => {
      try {
        await this.performRoutineMonitoring();
      } catch (error) {
        logger.error("Error in routine model monitoring", { error });
      }
    }, 3600000); // Every hour

    logger.info("Model monitoring started");
  }

  private async performRoutineMonitoring(): Promise<void> {
    const activeModels = Array.from(this.models.values()).filter(
      (model) => model.status === "active",
    );

    for (const model of activeModels) {
      try {
        // Check if model needs retraining
        const daysSinceTraining =
          (Date.now() - model.lastTrainedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceTraining > 90 && Math.random() > 0.95) {
          // 5% chance per hour after 90 days
          logger.info(`Model ${model.id} flagged for retraining`, {
            daysSinceTraining,
          });
          model.status = "needs_retraining";
        }

        // Update performance report periodically
        if (Math.random() > 0.9) {
          // 10% chance per hour
          await this.evaluateModelPerformance(model.id);
        }
      } catch (error) {
        logger.error(`Error monitoring model ${model.id}`, { error });
      }
    }
  }

  // ============================================================================
  // INITIALIZATION & DATA MANAGEMENT
  // ============================================================================

  private initializeDefaultModels(): void {
    const defaultModels: Partial<PredictionModel>[] = [
      {
        name: "Donor Lifetime Value Predictor",
        type: "lifetime_value",
        algorithm: "random_forest",
        features: [
          "total_donated",
          "donation_count",
          "avg_donation_amount",
          "donation_frequency",
          "engagement_score",
        ],
        performance: { r2Score: 0.78, rmse: 245.6, mae: 189.2 },
        status: "active",
      },
      {
        name: "Churn Risk Classifier",
        type: "churn_risk",
        algorithm: "logistic_regression",
        features: [
          "days_since_last_donation",
          "donation_frequency",
          "engagement_score",
          "recent_donation_count",
        ],
        performance: {
          accuracy: 0.82,
          precision: 0.79,
          recall: 0.85,
          f1Score: 0.82,
        },
        status: "active",
      },
      {
        name: "Optimal Ask Amount Predictor",
        type: "next_donation_amount",
        algorithm: "gradient_boosting",
        features: [
          "avg_donation_amount",
          "max_donation_amount",
          "recent_avg_amount",
          "donation_growth_trend",
        ],
        performance: { r2Score: 0.71, rmse: 87.3, mae: 62.1 },
        status: "active",
      },
      {
        name: "Contact Timing Optimizer",
        type: "next_donation_timing",
        algorithm: "random_forest",
        features: [
          "days_since_last_donation",
          "donation_frequency",
          "season",
          "day_of_week",
        ],
        performance: { r2Score: 0.64, rmse: 28.5, mae: 21.7 },
        status: "active",
      },
    ];

    defaultModels.forEach((modelData, index) => {
      const now = new Date();
      const model: PredictionModel = {
        id: `default_model_${index}`,
        name: modelData.name!,
        type: modelData.type!,
        algorithm: modelData.algorithm!,
        features: modelData.features!,
        performance: modelData.performance!,
        trainingData: {
          sampleSize: Math.floor(Math.random() * 5000) + 1000,
          dateRange: {
            start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
            end: now,
          },
          featureImportance: modelData.features!.reduce(
            (obj, feature) => {
              obj[feature] = Math.random() * 0.3 + 0.1;
              return obj;
            },
            {} as Record<string, number>,
          ),
        },
        status: modelData.status!,
        lastTrainedAt: new Date(
          now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        ), // Within last 30 days
        nextTrainingDue: this.calculateNextTrainingDate(),
        version: "1.0.0",
      };

      this.models.set(model.id, model);
    });

    logger.info(
      `Initialized ${defaultModels.length} default prediction models`,
    );
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  getModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }

  getModel(id: string): PredictionModel | null {
    return this.models.get(id) || null;
  }

  async getDonorPredictions(donorId: string): Promise<DonorPrediction[]> {
    return this.predictionCache.get(donorId) || [];
  }

  getModelPerformanceReport(modelId: string): ModelPerformanceReport | null {
    return this.modelPerformance.get(modelId) || null;
  }

  async generateComprehensivePredictions(donor: Donor): Promise<{
    lifetimeValue?: DonorPrediction;
    churnRisk?: DonorPrediction;
    optimalAmount?: DonorPrediction;
    contactTiming?: DonorPrediction;
    summary: {
      riskLevel: "low" | "medium" | "high";
      recommendedActions: string[];
      priorityScore: number;
    };
  }> {
    const predictions: any = {};

    // Generate all prediction types
    try {
      predictions.lifetimeValue = await this.predictLifetimeValue(donor);
      predictions.churnRisk = await this.predictChurnRisk(donor);
      predictions.optimalAmount = await this.predictOptimalAskAmount(donor);
      predictions.contactTiming = await this.predictContactTiming(donor);
    } catch (error) {
      logger.error(`Error generating predictions for donor ${donor.id}`, {
        error,
      });
    }

    // Generate summary and recommendations
    const summary = this.generatePredictionSummary(predictions);

    logger.info(`Generated comprehensive predictions for donor ${donor.id}`, {
      predictionsCount: Object.keys(predictions).filter((k) => k !== "summary")
        .length,
      riskLevel: summary.riskLevel,
    });

    return { ...predictions, summary };
  }

  private generatePredictionSummary(predictions: any): {
    riskLevel: "low" | "medium" | "high";
    recommendedActions: string[];
    priorityScore: number;
  } {
    let priorityScore = 50; // Base score
    const recommendedActions: string[] = [];

    // Analyze churn risk
    let riskLevel: "low" | "medium" | "high" = "medium";
    if (predictions.churnRisk) {
      const churnProb = predictions.churnRisk.prediction;
      if (churnProb > 0.7) {
        riskLevel = "high";
        priorityScore += 30;
        recommendedActions.push("Immediate re-engagement campaign needed");
      } else if (churnProb > 0.4) {
        riskLevel = "medium";
        priorityScore += 15;
        recommendedActions.push("Monitor engagement and consider outreach");
      } else {
        riskLevel = "low";
        priorityScore += 5;
        recommendedActions.push("Continue regular stewardship");
      }
    }

    // Analyze lifetime value
    if (predictions.lifetimeValue) {
      const ltv = predictions.lifetimeValue.prediction;
      if (ltv > 2000) {
        priorityScore += 20;
        recommendedActions.push(
          "High-value prospect - consider major gift approach",
        );
      } else if (ltv > 500) {
        priorityScore += 10;
        recommendedActions.push(
          "Strong donor potential - maintain regular contact",
        );
      }
    }

    // Analyze optimal amount
    if (predictions.optimalAmount) {
      recommendedActions.push(
        `Suggested ask amount: $${predictions.optimalAmount.prediction}`,
      );
    }

    // Analyze timing
    if (predictions.contactTiming) {
      const daysUntilNext = predictions.contactTiming.prediction;
      if (daysUntilNext < 30) {
        recommendedActions.push(
          "Good time for outreach - donor likely to respond soon",
        );
      }
    }

    return {
      riskLevel,
      recommendedActions,
      priorityScore: Math.min(Math.max(priorityScore, 0), 100),
    };
  }
}

// Export singleton instance
export const predictiveAnalyticsService =
  PredictiveAnalyticsService.getInstance();

// Export utility functions
export const predictLifetimeValue = (donor: Donor) => {
  return predictiveAnalyticsService.predictLifetimeValue(donor);
};

export const predictChurnRisk = (donor: Donor) => {
  return predictiveAnalyticsService.predictChurnRisk(donor);
};

export const predictOptimalAskAmount = (donor: Donor) => {
  return predictiveAnalyticsService.predictOptimalAskAmount(donor);
};

export const predictContactTiming = (donor: Donor) => {
  return predictiveAnalyticsService.predictContactTiming(donor);
};

export const generateComprehensivePredictions = (donor: Donor) => {
  return predictiveAnalyticsService.generateComprehensivePredictions(donor);
};

export const trainPredictionModel = (
  config: MLModelConfig,
  trainingData: TrainingDataSet,
) => {
  return predictiveAnalyticsService.trainModel(config, trainingData);
};

export const generateEnsemblePrediction = (
  donorId: string,
  predictionType: PredictionType,
  features: Record<string, any>,
) => {
  return predictiveAnalyticsService.generateEnsemblePrediction(
    donorId,
    predictionType,
    features,
  );
};

export const evaluateModelPerformance = (modelId: string) => {
  return predictiveAnalyticsService.evaluateModelPerformance(modelId);
};

logger.info("Predictive Analytics Service exports ready");
