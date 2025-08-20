import React, { useState, useMemo } from 'react';
import { useCampaigns } from "../../hooks/useCampaigns";
import { useClient } from "../../context/ClientContext";
import type { Campaign } from "../../models/campaign";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Mail,
  Settings,
  Eye,
  Printer,
  Share,
  Clock,
  CheckCircle
} from 'lucide-react';


// Mock data types matching your project structure

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'campaign' | 'donor' | 'financial';
  sections: ReportSection[];
  format: 'pdf' | 'excel' | 'csv';
  estimatedPages: number;
}

interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'chart' | 'table' | 'narrative' | 'metrics';
  required: boolean;
  description: string;
}

interface ReportConfig {
  template: ReportTemplate;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters: {
    campaignIds: string[];
    campaignTypes: string[];
    status: string[];
  };
  customizations: {
    title: string;
    subtitle: string;
    includeCharts: boolean;
    includeRawData: boolean;
    brandingLogo: boolean;
  };
  delivery: {
    format: 'pdf' | 'excel' | 'csv';
    email: string;
    schedule: 'now' | 'weekly' | 'monthly' | 'quarterly';
  };
}

// Report templates
const reportTemplates: ReportTemplate[] = [
  {
    id: 'executive_summary',
    name: 'Executive Summary Report',
    description: 'High-level overview for board meetings and leadership',
    type: 'executive',
    format: 'pdf',
    estimatedPages: 4,
    sections: [
      { id: 'overview', title: 'Executive Overview', type: 'summary', required: true, description: 'Key metrics and highlights' },
      { id: 'performance', title: 'Performance Summary', type: 'metrics', required: true, description: 'Campaign performance metrics' },
      { id: 'trends', title: 'Trend Analysis', type: 'chart', required: false, description: 'Visual trend charts' },
      { id: 'recommendations', title: 'Strategic Recommendations', type: 'narrative', required: false, description: 'Actionable insights' }
    ]
  },
  {
    id: 'campaign_detail',
    name: 'Detailed Campaign Report',
    description: 'Comprehensive analysis of individual or multiple campaigns',
    type: 'campaign',
    format: 'pdf',
    estimatedPages: 8,
    sections: [
      { id: 'campaign_overview', title: 'Campaign Overview', type: 'summary', required: true, description: 'Basic campaign information' },
      { id: 'performance_metrics', title: 'Performance Metrics', type: 'metrics', required: true, description: 'Detailed performance data' },
      { id: 'donor_analysis', title: 'Donor Analysis', type: 'table', required: true, description: 'Donor breakdown and segmentation' },
      { id: 'timeline', title: 'Campaign Timeline', type: 'chart', required: false, description: 'Progress over time' },
      { id: 'roi_analysis', title: 'ROI Analysis', type: 'metrics', required: false, description: 'Return on investment calculations' }
    ]
  },
  {
    id: 'donor_stewardship',
    name: 'Donor Stewardship Report',
    description: 'Impact report for donor communications and stewardship',
    type: 'donor',
    format: 'pdf',
    estimatedPages: 6,
    sections: [
      { id: 'impact_summary', title: 'Impact Summary', type: 'narrative', required: true, description: 'Mission impact achieved' },
      { id: 'donor_recognition', title: 'Donor Recognition', type: 'table', required: true, description: 'Donor acknowledgments' },
      { id: 'financials', title: 'Financial Transparency', type: 'metrics', required: true, description: 'How funds were used' },
      { id: 'stories', title: 'Success Stories', type: 'narrative', required: false, description: 'Beneficiary stories and testimonials' }
    ]
  },
  {
    id: 'financial_summary',
    name: 'Financial Summary Report',
    description: 'Financial performance and accounting export',
    type: 'financial',
    format: 'excel',
    estimatedPages: 2,
    sections: [
      { id: 'revenue_breakdown', title: 'Revenue Breakdown', type: 'table', required: true, description: 'Detailed revenue analysis' },
      { id: 'expense_tracking', title: 'Campaign Expenses', type: 'table', required: true, description: 'Marketing and operational costs' },
      { id: 'net_analysis', title: 'Net Impact Analysis', type: 'metrics', required: true, description: 'Net fundraising results' }
    ]
  }
];

  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>(reportTemplates[0]);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    template: reportTemplates[0],
    dateRange: {
      startDate: '2024-01-01',
      endDate: new Date().toISOString().split('T')[0]
    },
    filters: {
      campaignIds: [],
      campaignTypes: [],
      status: ['Active', 'Completed']
    },
    customizations: {
      title: 'Campaign Performance Report',
      subtitle: 'Generated on ' + new Date().toLocaleDateString(),
      includeCharts: true,
      includeRawData: false,
      brandingLogo: true
    },
    delivery: {
      format: 'pdf',
      email: '',
      schedule: 'now'
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Calculate report statistics
  const reportStats = useMemo(() => {
    const filteredCampaigns = clientCampaigns.filter(campaign => {
      const campaignDate = new Date(campaign.startDate);
      const startDate = new Date(reportConfig.dateRange.startDate);
      const endDate = new Date(reportConfig.dateRange.endDate);
      
      const matchesDate = campaignDate >= startDate && campaignDate <= endDate;
      const matchesStatus = reportConfig.filters.status.length === 0 || 
        reportConfig.filters.status.includes(campaign.status);
      const matchesType = reportConfig.filters.campaignTypes.length === 0 || 
        reportConfig.filters.campaignTypes.includes(campaign.type);
      const matchesId = reportConfig.filters.campaignIds.length === 0 || 
        reportConfig.filters.campaignIds.includes(campaign.id);
      
      return matchesDate && matchesStatus && matchesType && matchesId;
    });

    const totalRaised = filteredCampaigns.reduce((sum, c) => sum + c.raised, 0);
    const totalGoal = filteredCampaigns.reduce((sum, c) => sum + c.goal, 0);
    const totalDonors = filteredCampaigns.reduce((sum, c) => sum + c.donorCount, 0);
    const avgProgress = filteredCampaigns.length > 0 
      ? filteredCampaigns.reduce((sum, c) => sum + c.progress, 0) / filteredCampaigns.length 
      : 0;

    return {
      campaignCount: filteredCampaigns.length,
      totalRaised,
      totalGoal,
      totalDonors,
      avgProgress,
      filteredCampaigns
    };
  }, [reportConfig]);

  const handleTemplateChange = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setReportConfig(prev => ({
      ...prev,
      template,
      delivery: { ...prev.delivery, format: template.format }
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setGeneratedReport(`report_${Date.now()}.${reportConfig.delivery.format}`);
      setIsGenerating(false);
      setCurrentStep(4);
    }, 3000);
  };

  const handleDownloadReport = () => {
    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob(['Mock report content...'], { type: 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = generatedReport || 'report.pdf';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const steps = [
    { id: 1, title: 'Template Selection', icon: FileText },
    { id: 2, title: 'Configuration', icon: Settings },
    { id: 3, title: 'Preview & Generate', icon: Eye },
    { id: 4, title: 'Download & Share', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Report Generator</h2>
          <p className="text-slate-600">Create professional PDF reports for stakeholders and board presentations</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Estimated generation time: 30-60 seconds</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : currentStep === step.id 
                  ? 'border-blue-600 text-blue-600'
                  : 'border-slate-300 text-slate-400'
            }`}>
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-slate-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Choose Report Template</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateChange(template)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900">{template.name}</h4>
                    <p className="text-slate-600 text-sm mt-1">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      template.type === 'executive' ? 'bg-purple-100 text-purple-700' :
                      template.type === 'campaign' ? 'bg-blue-100 text-blue-700' :
                      template.type === 'donor' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {template.type}
                    </span>
                    <span className="text-xs text-slate-500">{template.estimatedPages} pages</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-slate-700">Includes:</div>
                  <ul className="space-y-1">
                    {template.sections.map((section) => (
                      <li key={section.id} className="flex items-center text-sm text-slate-600">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          section.required ? 'bg-blue-500' : 'bg-slate-300'
                        }`} />
                        {section.title}
                        {section.required && <span className="ml-1 text-xs text-blue-600">(required)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
            >
              Continue to Configuration
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Configure Report Settings</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Range & Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-medium text-slate-900 mb-4">Data Filters</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={reportConfig.dateRange.startDate}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, startDate: e.target.value }
                      }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <input
                      type="date"
                      value={reportConfig.dateRange.endDate}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, endDate: e.target.value }
                      }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Status</label>
                  <div className="space-y-2">
                    {['Active', 'Completed', 'Paused'].map((status) => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={reportConfig.filters.status.includes(status)}
                          onChange={(e) => {
                            const newStatus = e.target.checked
                              ? [...reportConfig.filters.status, status]
                              : reportConfig.filters.status.filter(s => s !== status);
                            setReportConfig(prev => ({
                              ...prev,
                              filters: { ...prev.filters, status: newStatus }
                            }));
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="ml-2 text-sm text-slate-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Customizations */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-medium text-slate-900 mb-4">Report Customization</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Report Title</label>
                  <input
                    type="text"
                    value={reportConfig.customizations.title}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      customizations: { ...prev.customizations, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={reportConfig.customizations.subtitle}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      customizations: { ...prev.customizations, subtitle: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.customizations.includeCharts}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        customizations: { ...prev.customizations, includeCharts: e.target.checked }
                      }))}
                      className="rounded border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">Include charts and graphs</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.customizations.includeRawData}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        customizations: { ...prev.customizations, includeRawData: e.target.checked }
                      }))}
                      className="rounded border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">Include raw data tables</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={reportConfig.customizations.brandingLogo}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        customizations: { ...prev.customizations, brandingLogo: e.target.checked }
                      }))}
                      className="rounded border-slate-300"
                    />
                    <span className="ml-2 text-sm text-slate-700">Include organization branding</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Back to Templates
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Preview Report
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Generate */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Report Preview & Generation</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Preview */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-medium text-slate-900 mb-4">Report Preview</h4>
              
              <div className="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">{reportConfig.customizations.title}</h2>
                  <p className="text-slate-600">{reportConfig.customizations.subtitle}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-medium text-slate-800 mb-3">Executive Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Total Campaigns:</span>
                        <span className="ml-2 font-medium">{reportStats.campaignCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Total Raised:</span>
                        <span className="ml-2 font-medium">{formatCurrency(reportStats.totalRaised)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Total Donors:</span>
                        <span className="ml-2 font-medium">{reportStats.totalDonors.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Avg Progress:</span>
                        <span className="ml-2 font-medium">{reportStats.avgProgress.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {reportConfig.customizations.includeCharts && (
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="font-medium text-slate-800 mb-3">Performance Charts</h3>
                      <div className="h-32 bg-gradient-to-r from-blue-100 to-green-100 rounded flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-slate-400" />
                        <span className="ml-2 text-slate-500">Chart Placeholder</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-medium text-slate-800 mb-3">Campaign Details</h3>
                    <div className="space-y-2">
                      {reportStats.filteredCampaigns.slice(0, 3).map((campaign) => (
                        <div key={campaign.id} className="flex justify-between text-sm">
                          <span className="text-slate-700">{campaign.name}</span>
                          <span className="font-medium">{formatCurrency(campaign.raised)}</span>
                        </div>
                      ))}
                      {reportStats.filteredCampaigns.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{reportStats.filteredCampaigns.length - 3} more campaigns...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation Settings */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h4 className="font-medium text-slate-900 mb-4">Export Settings</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
                    <select
                      value={reportConfig.delivery.format}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        delivery: { ...prev.delivery, format: e.target.value as 'pdf' | 'excel' | 'csv' }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="pdf">PDF Report</option>
                      <option value="excel">Excel Spreadsheet</option>
                      <option value="csv">CSV Data Export</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Delivery (Optional)</label>
                    <input
                      type="email"
                      value={reportConfig.delivery.email}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        delivery: { ...prev.delivery, email: e.target.value }
                      }))}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Schedule</label>
                    <select
                      value={reportConfig.delivery.schedule}
                      onChange={(e) => setReportConfig(prev => ({
                        ...prev,
                        delivery: { ...prev.delivery, schedule: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="now">Generate Now</option>
                      <option value="weekly">Weekly Schedule</option>
                      <option value="monthly">Monthly Schedule</option>
                      <option value="quarterly">Quarterly Schedule</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Report Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <div>Template: {selectedTemplate.name}</div>
                  <div>Campaigns: {reportStats.campaignCount}</div>
                  <div>Format: {reportConfig.delivery.format.toUpperCase()}</div>
                  <div>Est. Size: {selectedTemplate.estimatedPages} pages</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Back to Configuration
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Download & Share */}
      {currentStep === 4 && generatedReport && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Report Generated Successfully!</h3>
            <p className="text-slate-600">Your {selectedTemplate.name.toLowerCase()} is ready for download</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-medium text-slate-900">{generatedReport}</h4>
                  <p className="text-sm text-slate-500">
                    {reportConfig.delivery.format.toUpperCase()} • {selectedTemplate.estimatedPages} pages • Generated {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">{formatCurrency(reportStats.totalRaised)}</div>
                <div className="text-sm text-slate-500">Total Impact</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
              
              {reportConfig.delivery.email && (
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                  <Mail className="w-4 h-4" />
                  Email to {reportConfig.delivery.email}
                </button>
              )}
              
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                <Share className="w-4 h-4" />
                Share Link
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Report Includes</span>
              </div>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• {reportStats.campaignCount} campaigns analyzed</li>
                <li>• {reportStats.totalDonors.toLocaleString()} donor records</li>
                <li>• Financial performance metrics</li>
                <li>• Executive recommendations</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Next Steps</span>
              </div>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Review with leadership team</li>
                <li>• Share with board members</li>
                <li>• Schedule follow-up meetings</li>
                <li>• Plan next quarter strategy</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Automation</span>
              </div>
              <div className="text-sm text-purple-700">
                {reportConfig.delivery.schedule !== 'now' ? (
                  <div>
                    <p>This report is scheduled to generate {reportConfig.delivery.schedule}</p>
                    <button className="mt-2 text-xs underline">Manage schedule</button>
                  </div>
                ) : (
                  <div>
                    <p>Set up automatic report generation</p>
                    <button className="mt-2 text-xs underline">Create schedule</button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => {
                setCurrentStep(1);
                setGeneratedReport(null);
                setReportConfig(prev => ({
                  ...prev,
                  customizations: {
                    ...prev.customizations,
                    title: 'Campaign Performance Report',
                    subtitle: 'Generated on ' + new Date().toLocaleDateString()
                  }
                }));
              }}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Generate Another Report
            </button>
          </div>
        </div>
      )}
    </div>
  );

};export default ReportGenerator;