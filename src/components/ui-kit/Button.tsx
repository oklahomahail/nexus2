// src/components/ui-kit/Button.tsx
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  loading = false,
  ...props
}) => {
  const base = 'px-4 py-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-secondary',
    secondary: 'bg-brand-muted text-brand-dark hover:bg-gray-200 focus:ring-brand-primary',
    ghost: 'bg-transparent text-brand-primary hover:bg-gray-100 focus:ring-brand-primary',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  return (
    <button
      {...props}
      className={clsx(base, variants[variant], className)}
      disabled={loading || props.disabled}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};
