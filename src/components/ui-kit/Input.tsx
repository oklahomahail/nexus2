// src/components/ui-kit/Input.tsx
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={clsx(
          'w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-primary',
          className
        )}
      />
      {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
