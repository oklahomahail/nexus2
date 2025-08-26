import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Target,
  DollarSign,
  Award,
  BarChart3,
  Activity,
  Brain,
  Share2,
  Mail,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useClient } from "../../context/ClientContext";
import { useCampaigns } from "../../hooks/useCampaigns";

// Report Types
interface ExecutiveReport {
  id: string;
  title: string;
  type: "campaign" | "portfolio" | "comparative" | "quarterly";
  dateRange: { start: Date; end: Date };
  campaigns: string[];
  generatedAt: Date;
  insights: AIInsight[];
  metrics: ReportMetrics;
}

interface AIInsight {
  type: "success_factor" | "recommendation" | "trend" | "risk" | "opportunity";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  data?: any;
}

interface ReportMetrics {
  totalRaised: number;
  totalGoal: number;
  campaignCount: number;
  averagePerformance: number;
  topPerformer: string;
  trends: {
    raisedChange: number;
    efficiencyChange: number;
    velocityChange: number;
  };
}

// Report Templates
const REPORT_TEMPLATES = [
  {
    id: "executive_summary",
    name: "Executive Summary",
    description: "High-level overview for board meetings and leadership",
    audience: "C-Suite, Board Members",
    duration: "5-10 min read",
    sections: [
      "Key Metrics",
      "Performance Highlights",
      "Strategic Insights",
      "Recommendations",
    ],
  },
  {
    id: "campaign_deep_dive",
    name: "Campaign Deep Dive",
    description: "Comprehensive analysis of individual campaign performance",
    audience: "Campaign Managers, Development Team",
    duration: "15-20 min read",
    sections: [
      "Campaign Overview",
      "Timeline Analysis",
      "Channel Performance",
      "Optimization Opportunities",
    ],
  },
  {
    id: "portfolio_review",
    name: "Portfolio Review",
    description: "Cross-campaign analysis and organizational performance",
    audience: "Development Directors, Executive Team",
    duration: "10-15 min read",
    sections: [
      "Portfolio Metrics",
      "Comparative Analysis",
      "Trend Analysis",
      "Resource Allocation",
    ],
  },
  {
    id: "donor_presentation",
    name: "Donor Presentation",
    description: "Impact-focused report for major donors and foundations",
    audience: "Major Donors, Foundation Program Officers",
    duration: "8-12 min read",
    sections: [
      "Impact Summary",
      "Success Stories",
      "Financial Transparency",
      "Future Opportunities",
    ],
  },
];

const ExecutiveReportingSuite: React.FC = () => {
  const { campaigns, loading } = useCampaigns();
  const { currentClient } = useClient();

  // State management
  const [selectedTemplate, setSelectedTemplate] = useState(REPORT_TEMPLATES[0]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1), // Start of year
    end: new Date(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] =
    useState<ExecutiveReport | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["preview"]),
  );

  // Filter campaigns for current client and date range
  const availableCampaigns = useMemo(() => {
    if (!campaigns || !currentClient) return [];
    return campaigns.filter(
      (campaign) =>
        campaign.clientId === currentClient.id &&
        new Date(campaign.startDate) <= dateRange.end &&
        new Date(campaign.endDate) >= dateRange.start,
    );
  }, [campaigns, currentClient, dateRange]);

  // Generate mock AI insights
  const generateAIInsights = useCallback((campaignData: any[]): AIInsight[] => {
    const insights: AIInsight[] = [];

    if (campaignData.length === 0) return insights;

    // Success Factor Analysis
    const topPerformer = campaignData.reduce((best, current) =>
      current.raised / current.goal > best.raised / best.goal ? current : best,
    );

    insights.push({
      type: "success_factor",
      title: "Top Performance Driver Identified",
      description: `${topPerformer.name} achieved ${((topPerformer.raised / topPerformer.goal) * 100).toFixed(1)}% of its goal. Key success factors include optimal timing, targeted outreach, and strong case for support.`,
      priority: "high",
      confidence: 0.87,
    });

    // Trend Analysis
    const avgProgress =
      campaignData.reduce((sum, c) => sum + c.raised / c.goal, 0) /
      campaignData.length;
    if (avgProgress > 0.8) {
      insights.push({
        type: "trend",
        title: "Strong Portfolio Performance",
        description: `Portfolio is performing exceptionally well with ${(avgProgress * 100).toFixed(1)}% average goal achievement. This indicates effective campaign management and donor engagement strategies.`,
        priority: "medium",
        confidence: 0.92,
      });
    }

    // Recommendations
    const lowPerformers = campaignData.filter((c) => c.raised / c.goal < 0.5);
    if (lowPerformers.length > 0) {
      insights.push({
        type: "recommendation",
        title: "Optimization Opportunity",
        description: `${lowPerformers.length} campaign(s) are underperforming. Consider reallocating resources, refreshing messaging, or extending timelines to improve outcomes.`,
        priority: "high",
        confidence: 0.78,
      });
    }

    // Opportunity Analysis
    insights.push({
      type: "opportunity",
      title: "Scaling Successful Strategies",
      description: `The success patterns from ${topPerformer.name} can be replicated across other campaigns. Consider implementing similar outreach timing and donor segmentation strategies.`,
      priority: "medium",
      confidence: 0.83,
    });

    return insights;
  }, []);

  // Calculate report metrics
  const calculateReportMetrics = useCallback(
    (campaignData: any[]): ReportMetrics => {
      if (campaignData.length === 0) {
        return {
          totalRaised: 0,
          totalGoal: 0,
          campaignCount: 0,
          averagePerformance: 0,
          topPerformer: "",
          trends: { raisedChange: 0, efficiencyChange: 0, velocityChange: 0 },
        };
      }

      const totalRaised = campaignData.reduce((sum, c) => sum + c.raised, 0);
      const totalGoal = campaignData.reduce((sum, c) => sum + c.goal, 0);
      const averagePerformance = (totalRaised / totalGoal) * 100;

      const topPerformer = campaignData.reduce((best, current) =>
        current.raised / current.goal > best.raised / best.goal
          ? current
          : best,
      );

      return {
        totalRaised,
        totalGoal,
        campaignCount: campaignData.length,
        averagePerformance,
        topPerformer: topPerformer.name,
        trends: {
          raisedChange: 12.5, // Mock data
          efficiencyChange: 8.3,
          velocityChange: 15.2,
        },
      };
    },
    [],
  );

  // Generate report
  const generateReport = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const reportCampaigns =
        selectedCampaigns.length > 0
          ? availableCampaigns.filter((c) => selectedCampaigns.includes(c.id))
          : availableCampaigns;

      const insights = generateAIInsights(reportCampaigns);
      const metrics = calculateReportMetrics(reportCampaigns);

      const report: ExecutiveReport = {
        id: `report_${Date.now()}`,
        title: `${selectedTemplate.name} - ${currentClient?.name || "Organization"}`,
        type: selectedTemplate.id.includes("campaign")
          ? "campaign"
          : selectedTemplate.id.includes("portfolio")
            ? "portfolio"
            : "comparative",
        dateRange,
        campaigns: reportCampaigns.map((c) => c.id),
        generatedAt: new Date(),
        insights,
        metrics,
      };

      setGeneratedReport(report);
      setAiInsights(insights);
      setExpandedSections(new Set(["preview", "insights", "metrics"]));
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedTemplate,
    selectedCampaigns,
    availableCampaigns,
    dateRange,
    currentClient,
    generateAIInsights,
    calculateReportMetrics,
  ]);

  // Export report (mock implementation)
  const exportReport = useCallback(
    async (format: "pdf" | "docx" | "email") => {
      if (!generatedReport) return;

      // Mock export functionality
      const exportData = {
        report: generatedReport,
        format,
        timestamp: new Date().toISOString(),
      };

      console.log("Exporting report:", exportData);

      // In real implementation, this would call your export service
      alert(`Report exported as ${format.toUpperCase()}`);
    },
    [generatedReport],
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success_factor":
        return <Award className="h-4 w-4 text-green-500" />;
      case "recommendation":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "trend":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case "risk":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "opportunity":
        return <Sparkles className="h-4 w-4 text-yellow-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Executive Reporting Suite
          </h1>
          <p className="text-slate-600 mt-1">
            Generate professional reports with AI-powered insights for
            stakeholders
          </p>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Report Configuration
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Report Template
            </label>
            <div className="space-y-3">
              {REPORT_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>👥 {template.audience}</span>
                        <span>⏱️ {template.duration}</span>
                      </div>
                    </div>
                    {selectedTemplate.id === template.id && (
                      <CheckCircle className="h-5 w-5 text-blue-500 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Report Parameters */}
          <div className="space-y-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={dateRange.start.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: new Date(e.target.value),
                    }))
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: new Date(e.target.value),
                    }))
                  }
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Campaigns ({availableCampaigns.length} available)
              </label>
              <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.length === 0}
                      onChange={(e) =>
                        setSelectedCampaigns(
                          e.target.checked
                            ? []
                            : [availableCampaigns[0]?.id || ""],
                        )
                      }
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2 text-sm font-medium text-slate-700">
                      All Campaigns
                    </span>
                  </label>
                  {availableCampaigns.map((campaign) => (
                    <label key={campaign.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCampaigns((prev) => [
                              ...prev,
                              campaign.id,
                            ]);
                          } else {
                            setSelectedCampaigns((prev) =>
                              prev.filter((id) => id !== campaign.id),
                            );
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="ml-2 text-sm text-slate-600">
                        {campaign.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReport}
              disabled={isGenerating || availableCampaigns.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Report with AI Insights
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <div className="bg-white rounded-xl border border-slate-200">
          {/* Report Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {generatedReport.title}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Generated on{" "}
                  {generatedReport.generatedAt.toLocaleDateString()} •
                  {generatedReport.campaigns.length} campaigns analyzed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportReport("pdf")}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={() => exportReport("docx")}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Word
                </button>
                <button
                  onClick={() => exportReport("email")}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="divide-y divide-slate-200">
            {/* Executive Summary */}
            <div className="p-6">
              <button
                onClick={() => toggleSection("preview")}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  Executive Summary
                </h3>
                {expandedSections.has("preview") ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {expandedSections.has("preview") && (
                <div className="mt-4 space-y-4">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                          Total Raised
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(generatedReport.metrics.totalRaised)}
                      </p>
                      <p className="text-sm text-green-700">
                        +{generatedReport.metrics.trends.raisedChange}% vs last
                        period
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Goal Achievement
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {generatedReport.metrics.averagePerformance.toFixed(1)}%
                      </p>
                      <p className="text-sm text-blue-700">
                        of {formatCurrency(generatedReport.metrics.totalGoal)}{" "}
                        goal
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">
                          Active Campaigns
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {generatedReport.metrics.campaignCount}
                      </p>
                      <p className="text-sm text-purple-700">
                        in reporting period
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-900">
                          Top Performer
                        </span>
                      </div>
                      <p className="text-lg font-bold text-yellow-900">
                        {generatedReport.metrics.topPerformer}
                      </p>
                      <p className="text-sm text-yellow-700">
                        leading campaign
                      </p>
                    </div>
                  </div>

                  {/* Performance Chart */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-3">
                      Performance Trends
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "Jan", raised: 45000, goal: 50000 },
                            { month: "Feb", raised: 52000, goal: 55000 },
                            { month: "Mar", raised: 61000, goal: 60000 },
                            { month: "Apr", raised: 58000, goal: 65000 },
                            { month: "May", raised: 67000, goal: 70000 },
                            { month: "Jun", raised: 73000, goal: 75000 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="raised"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            name="Actual Raised"
                          />
                          <Line
                            type="monotone"
                            dataKey="goal"
                            stroke="#94A3B8"
                            strokeDasharray="5 5"
                            name="Target"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="p-6">
              <button
                onClick={() => toggleSection("insights")}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    AI-Powered Insights
                  </h3>
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    {aiInsights.length} insights
                  </span>
                </div>
                {expandedSections.has("insights") ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {expandedSections.has("insights") && (
                <div className="mt-4 space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-slate-900">
                              {insight.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(insight.priority)}`}
                            >
                              {insight.priority} priority
                            </span>
                            <span className="text-xs text-slate-500">
                              {(insight.confidence * 100).toFixed(0)}%
                              confidence
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detailed Metrics */}
            <div className="p-6">
              <button
                onClick={() => toggleSection("metrics")}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-lg font-semibold text-slate-900">
                  Detailed Analytics
                </h3>
                {expandedSections.has("metrics") ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {expandedSections.has("metrics") && (
                <div className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Campaign Performance Distribution */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3">
                        Campaign Performance Distribution
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { range: "0-25%", count: 1 },
                              { range: "26-50%", count: 2 },
                              { range: "51-75%", count: 3 },
                              { range: "76-100%", count: 4 },
                              { range: "100%+", count: 2 },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Trend Analysis */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3">
                        Performance Trends
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            Fundraising Velocity
                          </span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              +{generatedReport.metrics.trends.velocityChange}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            Campaign Efficiency
                          </span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              +{generatedReport.metrics.trends.efficiencyChange}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            Goal Achievement Rate
                          </span>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              +{generatedReport.metrics.trends.raisedChange}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Recommendations */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Strategic Recommendations
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Replicate successful strategies from{" "}
                          {generatedReport.metrics.topPerformer} across
                          underperforming campaigns
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Consider extending timelines for campaigns below 50%
                          goal achievement
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Increase focus on donor retention strategies to
                          improve repeat giving rates
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>
                          Implement real-time performance monitoring for early
                          intervention opportunities
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Templates Info */}
      {!generatedReport && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Report Template Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                📊 Executive Summary
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• High-level performance overview</li>
                <li>• Key metric summaries with trend analysis</li>
                <li>• AI-generated strategic insights</li>
                <li>• Board-ready visualizations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                🔍 Campaign Deep Dive
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Individual campaign performance analysis</li>
                <li>• Timeline and milestone tracking</li>
                <li>• Channel effectiveness breakdown</li>
                <li>• Optimization recommendations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                📈 Portfolio Review
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Cross-campaign comparative analysis</li>
                <li>• Resource allocation insights</li>
                <li>• Performance benchmarking</li>
                <li>• Strategic portfolio recommendations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">
                🎯 Donor Presentation
              </h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Impact-focused storytelling</li>
                <li>• Financial transparency reports</li>
                <li>• Success story highlights</li>
                <li>• Future opportunity mapping</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              AI-Powered Analysis
            </h3>
            <p className="text-slate-600 mb-4">
              Our advanced AI analyzes your campaign data to identify patterns,
              opportunities, and strategic recommendations that human analysis
              might miss.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-500" />
                <span>Success factor identification</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Performance trend analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span>Strategic recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>Opportunity identification</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Risk assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span>Predictive modeling</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {generatedReport && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
              <Share2 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium text-slate-900">
                  Share with Team
                </div>
                <div className="text-sm text-slate-600">
                  Send report to stakeholders
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-slate-900">
                  Schedule Regular Reports
                </div>
                <div className="text-sm text-slate-600">
                  Automate future reporting
                </div>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
              <Settings className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium text-slate-900">
                  Customize Template
                </div>
                <div className="text-sm text-slate-600">
                  Modify report structure
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveReportingSuite;
