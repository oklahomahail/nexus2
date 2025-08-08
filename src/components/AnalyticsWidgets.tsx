// src/components/AnalyticsWidgets.tsx - Specialized analytics and reporting components
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Calendar, Download, RefreshCw, Filter, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

// KPI Widget Component
interface KPIWidgetProps {
  title: string;
  value: number | string;
  previousValue?: number;
  format?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  trend,
  target,
  icon,
  color = 'blue',
  className = ''
}) => {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const calculateChange = () => {
    if (typeof value !== 'number' || !previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change;
  };

  const change = calculateChange();
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
  };

  const iconBgColors = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className={clsx('card-base p-6 relative overflow-hidden', className)}>
      {/* Background gradient */}
      <div className={clsx(
        'absolute inset-0 bg-gradient-to-br opacity-5',
        colorClasses[color]
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">
              {formatValue(value)}
            </p>
          </div>
          
          {icon && (
            <div className={clsx('p-3 rounded-xl', iconBgColors[color])}>
              {icon}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Change indicator */}
          {change !== null && (
            <div className="flex items-center space-x-2">
              <div className={clsx(
                'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                change > 0 ? 'bg-green-500/20 text-green-400' :
                change < 0 ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              )}>
                {change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                 change < 0 ? <TrendingDown className="w-3 h-3" /> : 
                 <div className="w-3 h-3" />}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
              <span className="text-xs text-slate-500">vs previous period</span>
            </div>
          )}

          {/* Progress bar for target */}
          {target && typeof value === 'number' && (
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress to target</span>
                <span>{((value / target) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className={clsx('h-2 rounded-full bg-gradient-to-r', colorClasses[color])}
                  style={{ width: `${Math.min((value / target) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Campaign Performance Summary
interface CampaignSummaryProps {
  campaigns: {
    id: string;
    name: string;
    goal: number;
    raised: number;
    donors: number;
    daysLeft: number;
    status: 'active' | 'completed' | 'paused';
  }[];
  className?: string;
}

export const CampaignPerformanceSummary: React.FC<CampaignSummaryProps> = ({ 
  campaigns, 
  className = '' 
}) => {
  const [sortBy, setSortBy] = useState<'progress' | 'raised' | 'donors'>('progress');

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return (b.raised / b.goal) - (a.raised / a.goal);
      case 'raised':
        return b.raised - a.raised;
      case 'donors':
        return b.donors - a.donors;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
            <p className="text-sm text-slate-400">{campaigns.length} active campaigns</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-base text-sm py-2 px-3"
            >
              <option value="progress">Sort by Progress</option>
              <option value="raised">Sort by Amount Raised</option>
              <option value="donors">Sort by Donor Count</option>
            </select>
            
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {sortedCampaigns.map((campaign) => {
          const progress = (campaign.raised / campaign.goal) * 100;
          
          return (
            <div key={campaign.id} className="p-4 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-white">{campaign.name}</h4>
                    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', getStatusColor(campaign.status))}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                    <span>${campaign.raised.toLocaleString()} raised</span>
                    <span>{campaign.donors} donors</span>
                    <span>{campaign.daysLeft}d left</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    {progress.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">
                    of ${campaign.goal.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Donation Trends Chart
interface DonationTrendsProps {
  data: {
    period: string;
    donations: number;
    amount: number;
  }[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  onTimeframeChange: (timeframe: 'daily' | 'weekly' | 'monthly') => void;
  className?: string;
}

export const DonationTrends: React.FC<DonationTrendsProps> = ({
  data,
  timeframe,
  onTimeframeChange,
  className = ''
}) => {
  const [metric, setMetric] = useState<'amount' | 'count'>('amount');
  
  const maxValue = Math.max(...data.map(d => metric === 'amount' ? d.amount : d.donations));
  
  return (
    <div className={clsx('card-base p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Donation Trends</h3>
          <p className="text-sm text-slate-400">
            {metric === 'amount' ? 'Total donation amounts' : 'Number of donations'} over time
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-800/50 rounded-xl p-1">
            <button
              onClick={() => setMetric('amount')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                metric === 'amount'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Amount
            </button>
            <button
              onClick={() => setMetric('count')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                metric === 'count'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Count
            </button>
          </div>

          <div className="flex bg-slate-800/50 rounded-xl p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
                  timeframe === tf
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => {
          const value = metric === 'amount' ? item.amount : item.donations;
          const height = (value / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2 group">
              <div className="relative w-full">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-purple-500 rounded-t-sm transition-all duration-300 group-hover:from-blue-500 group-hover:to-purple-400 cursor-pointer"
                  style={{ height: `${Math.max(height, 4)}px` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800/95 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {metric === 'amount' 
                      ? `$${item.amount.toLocaleString()}` 
                      : `${item.donations} donations`}
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 text-center">
                {item.period}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Export Widget
interface ExportWidgetProps {
  onExport: (format: string, dateRange?: { start: string; end: string }) => void;
  className?: string;
}

export const ExportWidget: React.FC<ExportWidgetProps> = ({ onExport, className = '' }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const formats = [
    { value: 'csv', label: 'CSV', description: 'Excel compatible' },
    { value: 'pdf', label: 'PDF', description: 'Report format' },
    { value: 'json', label: 'JSON', description: 'API format' }
  ];

  const handleExport = () => {
    onExport(format, dateRange.start && dateRange.end ? dateRange : undefined);
    setShowOptions(false);
  };

  return (
    <div className={clsx('card-base p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white">Export Data</h3>
          <p className="text-sm text-slate-400">Download campaign and donor data</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleExport}
            className="button-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  className={clsx(
                    'p-3 text-left rounded-lg border transition-all',
                    format === fmt.value
                      ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:bg-slate-700/30'
                  )}
                >
                  <div className="font-medium">{fmt.label}</div>
                  <div className="text-xs opacity-75">{fmt.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-base text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input-base text-sm"
                min={dateRange.start}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Real-time Activity Feed
interface Activity {
  id: string;
  type: 'donation' | 'new_donor' | 'campaign_update' | 'goal_reached';
  message: string;
  timestamp: Date;
  amount?: number;
  campaign?: string;
  donor?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  maxItems = 10,
  className = '' 
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'new_donor':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'campaign_update':
        return <Target className="w-4 h-4 text-purple-400" />;
      case 'goal_reached':
        return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      default:
        return <div className="w-4 h-4 bg-slate-400 rounded-full" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'donation':
        return 'border-green-500/30 bg-green-500/5';
      case 'new_donor':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'campaign_update':
        return 'border-purple-500/30 bg-purple-500/5';
      case 'goal_reached':
        return 'border-yellow-500/30 bg-yellow-500/5';
      default:
        return 'border-slate-500/30 bg-slate-500/5';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <p className="text-sm text-slate-400">Live updates from your campaigns</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto custom-scrollbar">
        {displayedActivities.length > 0 ? (
          <div className="p-4 space-y-3">
            {displayedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={clsx(
                  'p-4 rounded-xl border transition-all duration-200 hover:shadow-md',
                  getActivityColor(activity.type),
                  index === 0 && 'animate-fade-in'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-slate-800/50 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-relaxed">
                      {activity.message}
                      {activity.amount && (
                        <span className="font-semibold text-green-400 ml-1">
                          ${activity.amount.toLocaleString()}
                        </span>
                      )}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        {activity.campaign && (
                          <span className="px-2 py-0.5 bg-slate-700/50 rounded-full">
                            {activity.campaign}
                          </span>
                        )}
                        {activity.donor && (
                          <span className="px-2 py-0.5 bg-slate-700/50 rounded-full">
                            {activity.donor}
                          </span>
                        )}
                      </div>
                      
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No recent activity</h3>
            <p className="text-slate-400">Activity from your campaigns will appear here</p>
          </div>
        )}
      </div>

      {activities.length > maxItems && (
        <div className="p-4 border-t border-slate-700/50 text-center">
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View all activity ({activities.length - maxItems} more)
          </button>
        </div>
      )}
    </div>
  );
};

// Goal Progress Tracker
interface GoalTrackerProps {
  goals: {
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: Date;
    category: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  className?: string;
}

export const GoalProgressTracker: React.FC<GoalTrackerProps> = ({ goals, className = '' }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/5';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low':
        return 'border-green-500/30 bg-green-500/5';
      default:
        return 'border-slate-500/30 bg-slate-500/5';
    }
  };

  const getDaysLeft = (deadline: Date) => {
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const sortedGoals = [...goals].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className={clsx('card-base', className)}>
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Goal Progress</h3>
            <p className="text-sm text-slate-400">{goals.length} active goals</p>
          </div>
          <button className="button-ghost text-sm">
            Manage Goals
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {sortedGoals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const daysLeft = getDaysLeft(goal.deadline);
          const isOverdue = daysLeft < 0;
          const isUrgent = daysLeft <= 7 && daysLeft >= 0;

          return (
            <div
              key={goal.id}
              className={clsx(
                'p-4 rounded-xl border',
                getPriorityColor(goal.priority)
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{goal.name}</h4>
                  <p className="text-sm text-slate-400">{goal.category}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    ${goal.current.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">
                    of ${goal.target.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className={clsx(
                      'h-2 rounded-full transition-all duration-500',
                      progress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      progress >= 75 ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      progress >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    )}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    goal.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    goal.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  )}>
                    {goal.priority} priority
                  </span>
                </div>
                
                <span className={clsx(
                  'text-sm font-medium',
                  isOverdue ? 'text-red-400' :
                  isUrgent ? 'text-yellow-400' :
                  'text-slate-400'
                )}>
                  {isOverdue ? 'Overdue' : 
                   daysLeft === 0 ? 'Due today' :
                   daysLeft === 1 ? '1 day left' :
                   `${daysLeft} days left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
