import { forwardRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, ...props }, ref) => {
    const [value, setValue] = useState(props.value || '');
    
    const handleClear = () => {
      setValue('');
      onClear?.();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      props.onChange?.(e);
    };
    
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted" />
        </div>
        
        <input
          ref={ref}
          type="search"
          className={clsx(
            // Base styles
            'w-full pl-10 pr-10 py-2 text-body',
            'bg-elevated border border-border rounded-lg',
            'text-text placeholder:text-muted',
            'transition-all duration-200',
            
            // Focus states
            'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent',
            
            className
          )}
          value={value}
          onChange={handleChange}
          {...props}
        />
        
        {value && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-text transition-colors"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;