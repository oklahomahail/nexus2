// src/components/FormComponents.tsx - Advanced form components with validation
import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Upload, Eye, EyeOff, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

// Enhanced Input Component with validation
interface EnhancedInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  helperText?: string;
  maxLength?: number;
  className?: string;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  required,
  disabled,
  icon,
  helperText,
  maxLength,
  className = ''
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={clsx('space-y-2', className)}>
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={clsx(
            'input-base transition-all duration-200',
            icon && 'pl-10',
            (type === 'password' || success || error) && 'pr-10',
            error && 'border-red-500/50 bg-red-500/5 focus:ring-red-500/50',
            success && !error && 'border-green-500/50 bg-green-500/5 focus:ring-green-500/50',
            disabled && 'opacity-50 cursor-not-allowed',
            focused && !error && !success && 'border-blue-500/50 ring-2 ring-blue-500/20'
          )}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-sm text-slate-400">{helperText}</p>
          )}
        </div>
        {maxLength && (
          <p className={clsx(
            'text-xs',
            value.length > maxLength * 0.9 ? 'text-yellow-400' : 'text-slate-500'
          )}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

// Advanced Select Component
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

interface AdvancedSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
}

export const AdvancedSelect: React.FC<AdvancedSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  required,
  disabled,
  searchable = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={clsx('relative space-y-2', className)} ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between input-base text-left',
          error && 'border-red-500/50 bg-red-500/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-slate-600/50'
        )}
      >
        <div className="flex items-center space-x-2">
          {selectedOption?.icon}
          <span className={clsx(
            selectedOption ? 'text-white' : 'text-slate-400'
          )}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown className={clsx(
          'w-4 h-4 text-slate-400 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800/95 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg animate-fade-in">
          {searchable && (
            <div className="p-3 border-b border-slate-700/50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search options..."
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
            </div>
          )}
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors',
                    option.value === value && 'bg-blue-500/20 text-blue-300',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {option.icon}
                    <div>
                      <div className="text-white font-medium">{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-slate-400">{option.description}</div>
                      )}
                    </div>
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-blue-400" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// File Upload Component
interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  onFilesChange: (files: File[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
  preview?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  multiple = false,
  maxSize = 10,
  onFilesChange,
  error,
  required,
  className = '',
  preview = true
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    onFilesChange(validFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer',
          dragOver ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-600/50 hover:border-slate-500/50',
          error && 'border-red-500/50 bg-red-500/5'
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-slate-400">
            {accept && `Accepted formats: ${accept}`}
            {maxSize && ` • Max size: ${maxSize}MB`}
            {multiple && ' • Multiple files allowed'}
          </p>
        </div>
      </div>

      {preview && files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-400">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Date Range Picker
interface DateRangePickerProps {
  label: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error,
  required,
  className = ''
}) => {
  const quickRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This year', days: 0, isYear: true }
  ];

  const setQuickRange = (range: typeof quickRanges[0]) => {
    const end = new Date();
    let start: Date;

    if (range.isYear) {
      start = new Date(end.getFullYear(), 0, 1);
    } else {
      start = new Date(end.getTime() - range.days * 24 * 60 * 60 * 1000);
    }

    onStartDateChange(start.toISOString().split('T')[0]);
    onEndDateChange(end.toISOString().split('T')[0]);
  };

  return (
    <div className={clsx('space-y-3', className)}>
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className={clsx(
              'input-base pl-10',
              error && 'border-red-500/50 bg-red-500/5'
            )}
            placeholder="Start date"
          />
          <label className="absolute -top-2 left-2 px-2 bg-slate-800 text-xs text-slate-400">
            Start Date
          </label>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className={clsx(
              'input-base pl-10',
              error && 'border-red-500/50 bg-red-500/5'
            )}
            placeholder="End date"
            min={startDate}
          />
          <label className="absolute -top-2 left-2 px-2 bg-slate-800 text-xs text-slate-400">
            End Date
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 flex items-center mr-2">
          <Clock className="w-3 h-3 mr-1" />
          Quick ranges:
        </span>
        {quickRanges.map((range, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setQuickRange(range)}
            className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 text-xs text-slate-300 rounded-full transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

// Form Validation Hook
export const useFormValidation = (initialValues: Record<string, any>, rules: Record<string, any>) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: any) => {
    const fieldRules = rules[field];
    if (!fieldRules) return '';

    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      return fieldRules.message || `${field} is required`;
    }

    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      return `${field} must be at least ${fieldRules.minLength} characters`;
    }

    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      return `${field} must be no more than ${fieldRules.maxLength} characters`;
    }

    if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
      return fieldRules.patternMessage || `${field} format is invalid`;
    }

    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      return fieldRules.custom(value) || '';
    }

    return '';
  };

  const setValue = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const setFieldTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).every(key => !errors[key])
  };
};
