import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calculator,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Percent,
  Brain,
  Play,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
} from "recharts";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useClient } from "../../context/ClientContext";
import type { Campaign } from "../../models/campaign";

type PredictiveAnalyticsProps = {
  campaigns?: Campaign[]; // optional injection from parent
};

/* ----------------------------- Mock Fallback ----------------------------- */

const mockCampaigns: Campaign[] = [
  {
    id: "campaign_1",
    name: "End of Year Giving Campaign",
    goal: 50000,
    raised: 32500,
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    status: "Active" as const,
    donorCount: 127 as any,
    averageGift: 255 as any,
    marketingCost: 2600 as any,
    clientId: "acme" as any,
    type: "annual" as any,
  } as any,
  {
    id: "campaign_2",
    name: "Spring Education Fund",
    goal: 25000,
    raised: 8500,
    startDate: "2024-03-01",
    endDate: "2024-05-31",
    status: "Active" as const,
    donorCount: 45 as any,
    averageGift: 189 as any,
    marketingCost: 1275 as any,
    clientId: "acme" as any,
    type: "program" as any,
  } as any,
  {
    id: "campaign_3",
    name: "Emergency Relief Fund",
    goal: 75000,
    raised: 65000,
    startDate: "2024-10-01",
    endDate: "2024-11-15",
    status: "Completed" as const,
    donorCount: 245 as any,
    averageGift: 265 as any,
    marketingCost: 1800 as any,
    clientId: "acme" as any,
    type: "emergency" as any,
  } as any,
];

/* --------------------------------- Types -------------------------------- */

interface ForecastResult {
  projectedTotal: number;
  projectedCompletionDate: string;
  confidenceLevel: number;
  scenarioLabel: string;
  dailyProjections: DailyProjection[];
}

interface DailyProjection {
  date: string;
  day: number;
  projected: number;
  cumulative: number;
  confidence: number;
}

interface RiskFactor {
  factor: string;
  impact: "high" | "medium" | "low";
  probability: number;
  description: string;
  mitigation: string;
}

interface PredictionModel {
  campaign: Campaign;
  currentMetrics: {
    progressPercentage: number;
    daysElapsed: number;
    daysRemaining: number;
    dailyVelocity: number;
    efficiency: number;
    donorGrowthRate: number;
  };
  forecasts: {
    conservative: ForecastResult;
    realistic: ForecastResult;
    optimistic: ForecastResult;
  };
  successProbability: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
}

interface WhatIfScenario {
  name: string;
  adjustments: {
    dailyVelocityMultiplier?: number;
    donorGrowthMultiplier?: number;
    averageGiftMultiplier?: number;
    campaignExtension?: number; // days
  };
}

/* ----------------------------- Helper Utils ----------------------------- */

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);

const getSuccessColor = (prob: number) => {
  if (prob >= 80) return "text-green-600";
  if (prob >= 60) return "text-yellow-600";
  return "text-red-600";
};

const getRiskColor = (impact: RiskFactor["impact"]) => {
  if (impact === "high") return "bg-red-50 border-red-200 text-red-800";
  if (impact === "medium") return "bg-yellow-50 border-yellow-200 text-yellow-800";
  return "bg-blue-50 border-blue-200 text-blue-800";
};

/* ------------------------------- Component ------------------------------ */

const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  campaigns: injectedCampaigns,
}) => {
  const { campaigns: liveCampaigns, loading, error } = useCampaigns();
  const { currentClient } = useClient();

  // ✅ Prefer injected campaigns from parent, then live, then mocks
  const campaigns = (
    injectedCampaigns?.length
      ? injectedCampaigns
      : liveCampaigns?.length
      ? liveCampaigns
      : mockCampaigns
  ) as Campaign[];

  const clientId = (currentClient?.id ?? "acme") as string;

  const clientCampaigns = useMemo(
    () => campaigns.filter((c: any) => c.clientId === clientId),
    [campaigns, clientId]
  );

  const activeCampaigns = useMemo(
    () => clientCampaigns.filter((c) => c.status === "Active"),
    [clientCampaigns]
  );

  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    activeCampaigns[0]?.id ?? ""
  );

  // Keep selection in sync if the active set changes
  useEffect(() => {
    if (!activeCampaigns.find((c) => c.id === selectedCampaignId)) {
      setSelectedCampaignId(activeCampaigns[0]?.id ?? "");
    }
  }, [activeCampaigns, selectedCampaignId]);

  const [whatIfScenarios] = useState<WhatIfScenario[]>([
    { name: "Baseline", adjustments: {} },
    { name: "Increased Marketing (+20%)", adjustments: { dailyVelocityMultiplier: 1.2 } },
    { name: "Major Donor Push (+50% avg gift)", adjustments: { averageGiftMultiplier: 1.5 } },
    { name: "Campaign Extension (+14 days)", adjustments: { campaignExtension: 14 } },
  ]);

  const [customScenario, setCustomScenario] = useState<WhatIfScenario>({
    name: "Custom",
    adjustments: { dailyVelocityMultiplier: 1.0 },
  });

  const selectedCampaign =
    clientCampaigns.find((c) => c.id === selectedCampaignId) ??
    activeCampaigns[0] ??
    null;

  /* ------------------------- Prediction Calculations ------------------------- */

  const calculatePredictions = (campaign: Campaign): PredictionModel => {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const now = new Date();

    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / 86_400_000)
    );
    const daysElapsed = Math.max(
      0,
      Math.ceil((now.getTime() - startDate.getTime()) / 86_400_000)
    );
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const progressPercentage = (campaign.raised / campaign.goal) * 100;
    const dailyVelocity = daysElapsed > 0 ? campaign.raised / daysElapsed : 0;

    const expectedProgress = (daysElapsed / totalDays) * 100;
    const efficiency = expectedProgress > 0 ? progressPercentage / expectedProgress : 1;

    // Safe field access with defaults
    const donorCount = (campaign as any).donorCount ?? 0;
    const averageGift = (campaign as any).averageGift ?? 0;
    const _marketingCost = (campaign as any).marketingCost ?? 0;

    // Simple donor growth estimate
    const donorGrowthRate =
      daysElapsed > 7 ? Math.max(0, (Number(donorCount) - 50) / daysElapsed) : 2;

    // Success probability heuristic
    const progressScore = Math.min(progressPercentage / 100, 1) * 0.3;
    const velocityScore = Math.min(dailyVelocity / (campaign.goal / totalDays), 2) * 0.25;
    const efficiencyScore = Math.min(efficiency, 2) * 0.2;
    const timeScore =
      daysRemaining > 0 ? Math.min(1, daysRemaining / (totalDays * 0.3)) * 0.15 : 0;
    const donorScore = Math.min(Number(donorCount) / 100, 1) * 0.1;

    const successProbability = Math.min(
      95,
      Math.max(5, (progressScore + velocityScore + efficiencyScore + timeScore + donorScore) * 100)
    );

    const generateForecast = (
      scenario: "conservative" | "realistic" | "optimistic",
      velocityMultiplier: number
    ): ForecastResult => {
      const adjustedVelocity = dailyVelocity * velocityMultiplier;
      const volatilityFactor =
        scenario === "conservative" ? 0.8 : scenario === "optimistic" ? 1.2 : 1.0;

      const projectedTotal = Math.min(
        campaign.goal * 1.5,
        campaign.raised + adjustedVelocity * daysRemaining * volatilityFactor
      );

      const dailyProjections: DailyProjection[] = [];
      let cumulative = campaign.raised;

      for (let i = 0; i < Math.min(daysRemaining, 90); i++) {
        const date = new Date(now);
        date.setDate(date.getDate() + i + 1);

        const dailyGrowth =
          adjustedVelocity * volatilityFactor * (1 + Math.sin(i * 0.1) * 0.1);
        cumulative += dailyGrowth;

        const confidence = Math.max(60, 95 - i * 0.5);

        dailyProjections.push({
          date: date.toISOString().split("T")[0],
          day: daysElapsed + i + 1,
          projected: Math.round(dailyGrowth),
          cumulative: Math.round(cumulative),
          confidence: Math.round(confidence),
        });
      }

      const projectedCompletionDate =
        dailyProjections.find((p) => p.cumulative >= campaign.goal)?.date ||
        dailyProjections[dailyProjections.length - 1]?.date ||
        endDate.toISOString().split("T")[0];

      return {
        projectedTotal: Math.round(projectedTotal),
        projectedCompletionDate,
        confidenceLevel: scenario === "conservative" ? 85 : scenario === "optimistic" ? 65 : 75,
        scenarioLabel: scenario,
        dailyProjections,
      };
    };

    const forecasts = {
      conservative: generateForecast("conservative", 0.8),
      realistic: generateForecast("realistic", 1.0),
      optimistic: generateForecast("optimistic", 1.3),
    };

    // Risk factors
    const riskFactors: RiskFactor[] = [];
    if (efficiency < 0.8) {
      riskFactors.push({
        factor: "Below Target Pace",
        impact: "high",
        probability: 0.8,
        description: "Campaign is significantly behind schedule",
        mitigation: "Increase marketing spend or extend timeline",
      });
    }
    if (daysRemaining < 14 && progressPercentage < 90) {
      riskFactors.push({
        factor: "Time Pressure",
        impact: "high",
        probability: 0.9,
        description: "Limited time remaining to reach goal",
        mitigation: "Focus on major donors and urgent appeals",
      });
    }
    if (donorGrowthRate < 1) {
      riskFactors.push({
        factor: "Donor Acquisition",
        impact: "medium",
        probability: 0.7,
        description: "Slow donor growth may limit total reach",
        mitigation: "Expand outreach channels and referral programs",
      });
    }

    // Recommendations
    const recommendations: string[] = [];
    if (efficiency > 1.2) {
      recommendations.push("Consider increasing goal by 20–30% to maximize impact");
    } else if (efficiency < 0.8) {
      recommendations.push("Boost daily outreach efforts by 50% to get back on track");
    }
    if (averageGift && donorCount && averageGift < campaign.goal / Number(donorCount) / 2) {
      recommendations.push("Focus on increasing average gift size through targeted asks");
    }
    if (successProbability < 60) {
      recommendations.push("Consider strategic campaign adjustments or timeline extension");
    }

    return {
      campaign,
      currentMetrics: {
        progressPercentage,
        daysElapsed,
        daysRemaining,
        dailyVelocity,
        efficiency,
        donorGrowthRate,
      },
      forecasts,
      successProbability,
      riskFactors,
      recommendations,
    };
  };

  const predictionModel = useMemo(
    () => (selectedCampaign ? calculatePredictions(selectedCampaign) : null),
    [selectedCampaign]
  );

  /* ------------------------------- UI States ------------------------------ */

  if (loading && !injectedCampaigns?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-3 text-slate-400">Loading predictions...</span>
      </div>
    );
  }

  if (error && !injectedCampaigns?.length) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading campaigns: {error}</p>
      </div>
    );
  }

  if (!predictionModel) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
        <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Campaigns</h3>
        <p className="text-slate-600">Create an active campaign to see predictive analytics.</p>
      </div>
    );
  }

  /* ----------------------------- What-if Engine ---------------------------- */

  const calculateWhatIfScenario = (scenario: WhatIfScenario): ForecastResult | null => {
    const { campaign, currentMetrics } = predictionModel;
    const adjustments = scenario.adjustments;

    const adjustedVelocity =
      currentMetrics.dailyVelocity * (adjustments.dailyVelocityMultiplier || 1);
    const adjustedDaysRemaining =
      currentMetrics.daysRemaining + (adjustments.campaignExtension || 0);

    const projectedTotal = Math.min(
      campaign.goal * 1.5,
      campaign.raised + adjustedVelocity * adjustedDaysRemaining
    );

    const dailyProjections: DailyProjection[] = [];
    let cumulative = campaign.raised;

    for (let i = 0; i < Math.min(adjustedDaysRemaining, 90); i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      cumulative += adjustedVelocity;

      dailyProjections.push({
        date: date.toISOString().split("T")[0],
        day: currentMetrics.daysElapsed + i + 1,
        projected: Math.round(adjustedVelocity),
        cumulative: Math.round(cumulative),
        confidence: 70,
      });
    }

    const projectedCompletionDate =
      dailyProjections.find((p) => p.cumulative >= campaign.goal)?.date ||
      dailyProjections[dailyProjections.length - 1]?.date ||
      "";

    return {
      projectedTotal: Math.round(projectedTotal),
      projectedCompletionDate,
      confidenceLevel: 70,
      scenarioLabel: scenario.name,
      dailyProjections,
    };
  };

  const scenarioResults = whatIfScenarios
    .map((scenario) => ({ scenario, result: calculateWhatIfScenario(scenario) }))
    .filter(
      (s): s is { scenario: WhatIfScenario; result: ForecastResult } => Boolean(s.result)
    );

  const combinedChartData = [
    ...predictionModel.forecasts.realistic.dailyProjections.slice(0, 30).map((p) => ({
      ...p,
      realistic: p.cumulative,
      conservative:
        predictionModel.forecasts.conservative.dailyProjections.find((cp) => cp.day === p.day)
          ?.cumulative || 0,
      optimistic:
        predictionModel.forecasts.optimistic.dailyProjections.find((op) => op.day === p.day)
          ?.cumulative || 0,
    })),
  ];

  /* --------------------------------- Render -------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header & Campaign Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Predictive Analytics</h2>
          <p className="text-slate-600">
            AI-powered forecasting and scenario modeling for campaign success
          </p>
        </div>

        {activeCampaigns.length > 1 && (
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
          >
            {activeCampaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Success Probability & Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Success Probability</h3>
            <Brain className="w-5 h-5 text-purple-500" />
          </div>
          <div
            className={`text-3xl font-bold ${getSuccessColor(
              predictionModel.successProbability
            )}`}
          >
            {Math.round(predictionModel.successProbability)}%
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              style={{ width: `${predictionModel.successProbability}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Daily Velocity</h3>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(predictionModel.currentMetrics.dailyVelocity)}
          </div>
          <div className="text-sm text-slate-500">per day average</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Efficiency Ratio</h3>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div
            className={`text-2xl font-bold ${
              predictionModel.currentMetrics.efficiency > 1.1
                ? "text-green-600"
                : predictionModel.currentMetrics.efficiency < 0.9
                ? "text-red-600"
                : "text-slate-900"
            }`}
          >
            {predictionModel.currentMetrics.efficiency.toFixed(2)}x
          </div>
          <div className="text-sm text-slate-500">
            {predictionModel.currentMetrics.efficiency > 1 ? "Ahead of pace" : "Behind pace"}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-600">Projected Total</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(predictionModel.forecasts.realistic.projectedTotal)}
          </div>
          <div className="text-sm text-slate-500">realistic scenario</div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Forecast Scenarios</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedChartData}>
              <defs>
                <linearGradient id="optimisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="realisticGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(51, 65, 85, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <ReferenceLine
                y={predictionModel.campaign.goal}
                stroke="#dc2626"
                strokeDasharray="5 5"
                label="Goal"
              />

              <Area
                type="monotone"
                dataKey="optimistic"
                stackId="1"
                stroke="#10B981"
                fill="url(#optimisticGradient)"
                name="Optimistic"
              />
              <Area
                type="monotone"
                dataKey="realistic"
                stackId="2"
                stroke="#3B82F6"
                fill="url(#realisticGradient)"
                name="Realistic"
              />
              <Area
                type="monotone"
                dataKey="conservative"
                stackId="3"
                stroke="#F59E0B"
                fill="url(#conservativeGradient)"
                name="Conservative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* What-If Scenarios */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">What-If Scenario Analysis</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-800 mb-3">Scenario Comparison</h4>
            <div className="space-y-3">
              {scenarioResults.map(({ scenario, result }, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-800">{scenario.name}</span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(result.projectedTotal)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Completion: {new Date(result.projectedCompletionDate).toLocaleDateString()}
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (result.projectedTotal / predictionModel.campaign.goal) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-800 mb-3">Custom Scenario Builder</h4>
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Daily Velocity Multiplier
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={customScenario.adjustments.dailyVelocityMultiplier || 1}
                  onChange={(e) =>
                    setCustomScenario({
                      ...customScenario,
                      adjustments: {
                        ...customScenario.adjustments,
                        dailyVelocityMultiplier: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>50% slower</span>
                  <span>
                    {((customScenario.adjustments.dailyVelocityMultiplier || 1) * 100).toFixed(0)}%
                  </span>
                  <span>2x faster</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded border">
                <div className="text-sm font-medium text-slate-800">Custom Projection:</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(calculateWhatIfScenario(customScenario)?.projectedTotal || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Risk Factors
          </h3>
          <div className="space-y-3">
            {predictionModel.riskFactors.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-slate-600">No significant risks identified</p>
              </div>
            ) : (
              predictionModel.riskFactors.map((risk, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getRiskColor(risk.impact)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{risk.factor}</h4>
                    <span className="text-xs px-2 py-1 bg-white rounded">
                      {Math.round(risk.probability * 100)}% likely
                    </span>
                  </div>
                  <p className="text-sm mb-2">{risk.description}</p>
                  <p className="text-xs font-medium">Mitigation: {risk.mitigation}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {predictionModel.recommendations.map((rec, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">{rec}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Success Drivers</h4>
            <div className="text-sm text-green-700">
              Based on your current performance, focus on maintaining daily velocity above{" "}
              {formatCurrency(predictionModel.currentMetrics.dailyVelocity * 0.9)} to stay on track.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
