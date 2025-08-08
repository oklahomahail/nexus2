// src/panels/NotificationsPanel.tsx - Modernized with unified design system
import React, { useState } from 'react';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock, Filter } from 'lucide-react';
import clsx from 'clsx';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'campaign' | 'donor' | 'system' | 'report';
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationsPanelProps {
  notifications?: Notification[];
  onClose?: () => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications = [],
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sample notifications if none provided
  const defaultNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Campaign Milestone Reached!',
      message: 'Your "End of Year Giving" campaign has reached 75% of its $50,000 goal with $37,500 raised.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      read: false,
      category: 'campaign',
      actionUrl: '/campaigns/eoy-giving',
      actionLabel: 'View Campaign'
    },
    {
      id: '2',
      type: 'info',
      title: 'New Major Donor',
      message: 'Sarah Johnson has made a $5,000 donation and qualifies as a major donor. Consider adding her to your stewardship program.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      category: 'donor',
      actionUrl: '/donors/sarah-johnson',
      actionLabel: 'View Profile'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Campaign Deadline Approaching',
      message: 'Your "CASA Holiday Drive" campaign ends in 3 days. Consider sending a final appeal to boost donations.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      category: 'campaign',
      actionUrl: '/campaigns/casa-holiday',
      actionLabel: 'Send Appeal'
    },
    {
      id: '4',
      type: 'info',
      title: 'Monthly Report Generated',
      message: 'Your October fundraising report is ready for review. Total raised: $127,500 across 8 active campaigns.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      category: 'report',
      actionUrl: '/reports/october-2024',
      actionLabel: 'View Report'
    },
    {
      id: '5',
      type: 'error',
      title: 'Payment Processing Issue',
      message: 'A recurring donation from David Chen failed to process. The donor has been notified and may need to update their payment method.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: false,
      category: 'system',
      actionUrl: '/donors/david-chen',
      actionLabel: 'Contact Donor'
    }
  ];

  const allNotifications = notifications.length > 0 ? notifications : defaultNotifications;
  
  const filteredNotifications = allNotifications.filter(notification => {
    if (filter === 'unread' && notification.read) return false;
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) return false;
    return true;
  });

  const unreadCount = allNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'info':
      default:
        return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'campaign':
        return '🎯';
      case 'donor':
        return '👤';
      case 'system':
        return '⚙️';
      case 'report':
        return '📊';
      default:
        return '📝';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const categories = [
    { value: 'all', label: 'All Categories', count: allNotifications.length },
    { value: 'campaign', label: 'Campaigns', count: allNotifications.filter(n => n.category === 'campaign').length },
    { value: 'donor', label: 'Donors', count: allNotifications.filter(n => n.category === 'donor').length },
    { value: 'system', label: 'System', count: allNotifications.filter(n => n.category === 'system').length },
    { value: 'report', label: 'Reports', count: allNotifications.filter(n => n.category === 'report').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-base p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              <p className="text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                filter === 'all'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              All ({allNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                filter === 'unread'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:ml-auto">
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={onMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="card-base p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filter by category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setCategoryFilter(category.value)}
              className={clsx(
                'flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                categoryFilter === category.value
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'text-slate-400 border-slate-700/50 hover:text-slate-300 hover:border-slate-600/50'
              )}
            >
              <span>{getCategoryIcon(category.value)}</span>
              <span>{category.label}</span>
              <span className="bg-slate-600/50 text-slate-300 px-1.5 py-0.5 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={clsx(
                'card-base p-4 cursor-pointer transition-all duration-200 hover:shadow-md border',
                !notification.read && 'ring-1 ring-blue-500/20',
                getNotificationColors(notification.type)
              )}
              onClick={() => onNotificationClick?.(notification)}
            >
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={clsx(
                      'font-semibold text-sm',
                      notification.read ? 'text-slate-300' : 'text-white'
                    )}>
                      {notification.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  <p className={clsx(
                    'text-sm leading-relaxed mb-3',
                    notification.read ? 'text-slate-400' : 'text-slate-300'
                  )}>
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">
                        {getCategoryIcon(notification.category)} {notification.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {notification.actionLabel && (
                        <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                          {notification.actionLabel} →
                        </button>
                      )}
                      
                      {!notification.read && onMarkAsRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card-base p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-slate-400">
              {filter === 'unread' 
                ? 'All your notifications have been read.' 
                : 'You\'ll see important updates about your campaigns and donors here.'}
            </p>
          </div>
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 10 && (
        <div className="text-center">
          <button className="button-ghost">
            Load more notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
