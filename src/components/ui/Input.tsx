import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-body-sm font-medium text-text">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={clsx(
            // Base styles - quiet design
            'w-full px-3 py-2 text-body',
            'bg-elevated border border-border rounded-lg',
            'text-text placeholder:text-muted',
            'transition-all duration-200',
            
            // Focus states
            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
            
            // Error states
            error && 'border-error focus:ring-error focus:border-error',
            
            // Disabled states
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-panel',
            
            className
          )}
          {...props}
        />
        
        {(error || hint) && (
          <div className="text-caption">
            {error ? (
              <span className="text-error">{error}</span>
            ) : (
              <span className="text-muted">{hint}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;