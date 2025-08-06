// src/components/ui/Panel.tsx
import React from 'react';
import clsx from 'clsx';

interface PanelProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  titleSize?: 'sm' | 'md' | 'lg';
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'soft' | 'medium' | 'strong';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  headerActions?: React.ReactNode;
  fullHeight?: boolean;
  variant?: 'default' | 'brand' | 'muted';
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  children,
  className = '',
  titleSize = 'md',
  padding = 'md',
  shadow = 'soft',
  rounded = '2xl',
  headerActions,
  fullHeight = false,
  variant = 'default'
}) => {
  const titleSizeClasses = {
    sm: 'text-lg font-medium',
    md: 'text-xl font-semibold',
    lg: 'text-2xl font-bold'
  };

  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: 'shadow-none',
    soft: 'shadow-soft border border-gray-200',
    medium: 'shadow-md',
    strong: 'shadow-lg'
  };

  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  const variantClasses = {
    default: 'bg-white',
    brand: 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white',
    muted: 'bg-brand-muted border border-brand-secondary/20'
  };

  const textColorClasses = {
    default: 'text-gray-900',
    brand: 'text-white',
    muted: 'text-brand-dark'
  };

  const subtitleColorClasses = {
    default: 'text-gray-600',
    brand: 'text-white/80',
    muted: 'text-brand-primary/70'
  };

  const borderColorClasses = {
    default: 'border-gray-200',
    brand: 'border-white/20',
    muted: 'border-brand-secondary/20'
  };

  return (
    <div className={clsx(
      variantClasses[variant],
      shadowClasses[shadow],
      roundedClasses[rounded],
      fullHeight && 'h-full flex flex-col',
      className
    )}>
      {(title || subtitle || headerActions) && (
        <div className={clsx(
          'border-b',
          borderColorClasses[variant],
          paddingClasses[padding],
          'pb-4'
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h2 className={clsx(
                  titleSizeClasses[titleSize], 
                  textColorClasses[variant]
                )}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className={clsx(
                  'text-sm mt-1',
                  subtitleColorClasses[variant]
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-2 ml-4">
                {headerActions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={clsx(
        paddingClasses[padding],
        (title || subtitle || headerActions) && 'pt-4',
        fullHeight && 'flex-1'
      )}>
        {children}
      </div>
    </div>
  );
};

// Specialized Panel variants for Nexus fundraising platform
export const CampaignPanel: React.FC<Omit<PanelProps, 'className'> & { className?: string }> = (props) => (
  <Panel
    {...props}
    className={clsx('border-l-4 border-l-brand-secondary', props.className)}
  />
);

export const AnalyticsPanel: React.FC<Omit<PanelProps, 'className'> & { className?: string }> = (props) => (
  <Panel
    {...props}
    variant="muted"
    className={props.className}
  />
);

export const HighlightPanel: React.FC<Omit<PanelProps, 'variant'> & { className?: string }> = (props) => (
  <Panel
    {...props}
    variant="brand"
  />
);

export const AlertPanel: React.FC<Omit<PanelProps, 'className' | 'shadow' | 'variant'> & { 
  className?: string;
  alertType?: 'info' | 'success' | 'warning' | 'error';
}> = ({ alertType = 'info', ...props }) => {
  const alertClasses = {
    info: 'border-l-4 border-l-brand-secondary bg-brand-secondary/5',
    success: 'border-l-4 border-l-green-500 bg-green-50',
    warning: 'border-l-4 border-l-yellow-500 bg-yellow-50',
    error: 'border-l-4 border-l-brand-accent bg-brand-accent/5'
  };

  return (
    <Panel
      {...props}
      shadow="none"
      className={clsx(alertClasses[alertType], props.className)}
    />
  );
};

export default Panel;