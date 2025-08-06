// src/components/ui/Card.tsx
import React from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'bordered' | 'ghost' | 'brand';
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  onClick,
  hover = true,
  padding = 'md',
  variant = 'default',
  headerActions,
  footer
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-soft',
    elevated: 'bg-white shadow-md border border-gray-100',
    bordered: 'bg-white border-2 border-brand-secondary/20',
    ghost: 'bg-brand-muted/50 border border-brand-secondary/10',
    brand: 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-soft'
  };

  const textColors = {
    default: 'text-gray-900',
    elevated: 'text-gray-900', 
    bordered: 'text-gray-900',
    ghost: 'text-brand-dark',
    brand: 'text-white'
  };

  const subtitleColors = {
    default: 'text-gray-600',
    elevated: 'text-gray-600',
    bordered: 'text-gray-600', 
    ghost: 'text-brand-primary',
    brand: 'text-white/80'
  };

  const borderColors = {
    default: 'border-gray-100',
    elevated: 'border-gray-100',
    bordered: 'border-brand-secondary/20',
    ghost: 'border-brand-secondary/20',
    brand: 'border-white/20'
  };

  const hoverClasses = hover ? {
    default: 'hover:shadow-md hover:-translate-y-0.5 hover:border-brand-secondary/30',
    elevated: 'hover:shadow-lg hover:-translate-y-0.5', 
    bordered: 'hover:border-brand-secondary/40 hover:-translate-y-0.5',
    ghost: 'hover:bg-brand-muted hover:-translate-y-0.5',
    brand: 'hover:shadow-lg hover:-translate-y-0.5 hover:from-brand-primary/90 hover:to-brand-secondary/90'
  } : {};

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={clsx(
        'rounded-2xl transition-all duration-200',
        variantClasses[variant],
        hover && hoverClasses[variant],
        onClick && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2',
        className
      )}
    >
      {(title || subtitle || headerActions) && (
        <div className={clsx(
          paddingClasses[padding],
          'border-b pb-4',
          borderColors[variant]
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={clsx(
                  'text-lg font-semibold truncate',
                  textColors[variant]
                )}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={clsx(
                  'text-sm mt-1',
                  subtitleColors[variant]
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={clsx(
        paddingClasses[padding],
        (title || subtitle || headerActions) && 'pt-4'
      )}>
        {children}
      </div>

      {footer && (
        <div className={clsx(
          paddingClasses[padding],
          'border-t pt-4 rounded-b-2xl',
          borderColors[variant],
          variant === 'brand' ? 'bg-black/10' : variant === 'ghost' ? 'bg-brand-muted' : 'bg-gray-50'
        )}>
          {footer}
        </div>
      )}
    </Component>
  );
};

// Specialized Card variants for Nexus fundraising
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
  iconColor?: string;
  className?: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ 
  title, 
  value, 
  change, 
  icon, 
  iconColor = 'bg-brand-secondary/10 text-brand-secondary', 
  className,
  trend
}) => {
  const getTrendIcon = () => {
    if (trend === 'up' || (change !== undefined && change > 0)) return '↗️';
    if (trend === 'down' || (change !== undefined && change < 0)) return '↘️';
    return '➡️';
  };

  const getTrendColor = () => {
    if (trend === 'up' || (change !== undefined && change > 0)) return 'text-green-600';
    if (trend === 'down' || (change !== undefined && change < 0)) return 'text-brand-accent';
    return 'text-gray-600';
  };

  return (
    <Card 
      className={clsx('relative overflow-hidden', className)} 
      padding="md" 
      variant="elevated"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-brand-primary/80">{title}</p>
          <p className="text-2xl font-bold text-brand-dark mt-1">{value}</p>
          {(change !== undefined || trend) && (
            <div className="flex items-center mt-2">
              <span className="text-sm mr-1">{getTrendIcon()}</span>
              <span className={clsx('text-sm font-medium', getTrendColor())}>
                {change !== undefined ? `${change > 0 ? '+' : ''}${change}%` : trend}
              </span>
              <span className="text-sm text-gray-600 ml-1">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
            iconColor
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export const CampaignQuickCard: React.FC<{
  campaign: {
    name: string;
    status: 'Active' | 'Planned' | 'Completed' | 'Cancelled';
    raised: number;
    goal: number;
    daysLeft: number;
    category?: string;
  };
  onClick?: () => void;
  className?: string;
}> = ({ campaign, onClick, className }) => {
  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
  
  const statusColors = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Planned: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200',
    Cancelled: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
  };

  const categoryIcons: Record<string, string> = {
    'Education': '🎓',
    'Healthcare': '🏥',
    'Environment': '🌱',
    'Emergency': '🚨',
    'Community': '🏘️',
    'General': '📋'
  };

  return (
    <Card
      onClick={onClick}
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          {campaign.category && (
            <span className="text-lg">{categoryIcons[campaign.category] || '📋'}</span>
          )}
          <span className={clsx(
            'px-2.5 py-1 rounded-full text-xs font-medium border',
            statusColors[campaign.status]
          )}>
            {campaign.status}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        <h3 className="font-semibold text-brand-dark text-lg leading-tight line-clamp-2">
          {campaign.name}
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold text-brand-secondary">
              ${campaign.raised.toLocaleString()}
            </span>
            <span className="text-brand-primary/70">
              of ${campaign.goal.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-brand-secondary to-brand-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-brand-primary font-medium">
              {progressPercentage.toFixed(1)}% Complete
            </span>
            <span className={clsx(
              'font-medium',
              campaign.daysLeft <= 7 ? 'text-brand-accent' : 'text-brand-primary/70'
            )}>
              {campaign.daysLeft > 0 ? `${campaign.daysLeft} days left` : 'Ended'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const DonorCard: React.FC<{
  donor: {
    name: string;
    email: string;
    totalGiven: number;
    lastGiftDate?: Date;
    donationCount?: number;
  };
  onClick?: () => void;
  className?: string;
}> = ({ donor, onClick, className }) => (
  <Card
    title={donor.name}
    subtitle={donor.email}
    onClick={onClick}
    className={className}
    headerActions={
      <div className="text-right">
        <p className="text-lg font-bold text-brand-secondary">
          ${donor.totalGiven.toLocaleString()}
        </p>
        <p className="text-xs text-brand-primary/70">Total Given</p>
      </div>
    }
  >
    <div className="grid grid-cols-2 gap-4 text-sm">
      {donor.donationCount && (
        <div>
          <p className="text-brand-primary/70">Donations</p>
          <p className="font-semibold text-brand-dark">{donor.donationCount}</p>
        </div>
      )}
      {donor.lastGiftDate && (
        <div>
          <p className="text-brand-primary/70">Last Gift</p>
          <p className="font-semibold text-brand-dark">
            {donor.lastGiftDate.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  </Card>
);

export default Card;