import clsx from "clsx";
import React, { useState, useRef, useEffect, useCallback } from "react";

export interface Option {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  options: Option[];
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  onSelect?: (option: Option, options: Option[]) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outlined";
  maxHeight?: string;
  emptyText?: string;
  loadingText?: string;
  searchPlaceholder?: string;
  className?: string;
  dropdownClassName?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

const ChevronDownIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  onSelect,
  placeholder = "Select an option...",
  disabled = false,
  loading = false,
  clearable = false,
  searchable = false,
  multiple = false,
  size = "md",
  variant = "default",
  maxHeight = "200px",
  emptyText = "No options available",
  loadingText = "Loading...",
  searchPlaceholder = "Search options...",
  className,
  dropdownClassName,
  error,
  label,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedValues, setSelectedValues] = useState<any[]>(() => {
    const initialValue = value !== undefined ? value : defaultValue;
    if (multiple) {
      return Array.isArray(initialValue)
        ? initialValue
        : initialValue
          ? [initialValue]
          : [];
    }
    return initialValue ? [initialValue] : [];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle option selection
  const handleOptionSelect = useCallback(
    (option: Option) => {
      if (option.disabled) return;

      let newValues: any[];

      if (multiple) {
        const isSelected = selectedValues.includes(option.value);
        newValues = isSelected
          ? selectedValues.filter((v) => v !== option.value)
          : [...selectedValues, option.value];
      } else {
        newValues = [option.value];
        setIsOpen(false);
        setSearchQuery("");
      }

      setSelectedValues(newValues);

      const outputValue = multiple ? newValues : newValues[0];
      onChange?.(outputValue);

      const selectedOptions = options.filter((opt) =>
        multiple ? newValues.includes(opt.value) : opt.value === outputValue,
      );

      onSelect?.(option, selectedOptions);
    },
    [multiple, selectedValues, onChange, onSelect, options],
  );

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValues([]);
      const outputValue = multiple ? [] : undefined;
      onChange?.(outputValue);
      onSelect?.(null as any, []);
    },
    [multiple, onChange, onSelect],
  );

  // Get selected options for display
  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value),
  );

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  // Variant classes
  const variantClasses = {
    default: "bg-slate-800 border border-slate-700 text-white",
    filled: "bg-slate-700 border-transparent text-white",
    outlined: "bg-transparent border-2 border-slate-600 text-white",
  };

  // Error styles
  const errorStyles = error
    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
    : "focus:ring-blue-500 focus:border-blue-500";

  // Render selected values
  const renderSelectedValues = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-slate-400">{placeholder}</span>;
    }

    if (multiple && selectedOptions.length > 1) {
      return (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
            >
              {option.icon && <span className="w-3 h-3">{option.icon}</span>}
              {option.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionSelect(option);
                }}
                className="hover:bg-blue-700 rounded p-0.5"
              >
                <XIcon />
              </button>
            </span>
          ))}
        </div>
      );
    }

    const option = selectedOptions[0];
    return (
      <span className="flex items-center gap-2">
        {option.icon && <span className="w-4 h-4">{option.icon}</span>}
        {option.label}
      </span>
    );
  };

  // Render option
  const renderOption = (option: Option, _index: number) => {
    const isSelected = selectedValues.includes(option.value);

    return (
      <div
        key={option.value}
        className={clsx(
          "px-3 py-2 cursor-pointer transition-colors flex items-center gap-2 text-sm",
          option.disabled
            ? "text-slate-500 cursor-not-allowed"
            : "text-slate-200 hover:bg-slate-700",
          isSelected && "bg-blue-600/20 text-blue-300",
        )}
        onClick={() => handleOptionSelect(option)}
      >
        {multiple && (
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="rounded border-slate-600 text-blue-600"
          />
        )}

        {option.icon && (
          <span className="w-4 h-4 flex-shrink-0">{option.icon}</span>
        )}

        <div className="flex-1 min-w-0">
          <div className="truncate">{option.label}</div>
          {option.description && (
            <div className="text-xs text-slate-400 truncate">
              {option.description}
            </div>
          )}
        </div>

        {isSelected && !multiple && (
          <svg
            className="w-4 h-4 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className={clsx("relative", className)}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-slate-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        {/* Select trigger */}
        <div
          className={clsx(
            "relative w-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg",
            sizeClasses[size],
            variantClasses[variant],
            errorStyles,
            disabled && "opacity-50 cursor-not-allowed bg-slate-800",
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between min-h-[20px]">
            <div className="flex-1 mr-2 min-w-0">{renderSelectedValues()}</div>

            <div className="flex items-center gap-1">
              {clearable && selectedOptions.length > 0 && !disabled && (
                <button
                  onClick={handleClear}
                  className="p-1 hover:bg-slate-600 rounded transition-colors"
                >
                  <XIcon />
                </button>
              )}

              <span
                className={clsx("transition-transform", isOpen && "rotate-180")}
              >
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={clsx(
              "absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden",
              dropdownClassName,
            )}
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-slate-700">
                <div className="relative">
                  <SearchIcon />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <SearchIcon />
                  </span>
                </div>
              </div>
            )}

            {/* Options list */}
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {loading ? (
                <div className="px-3 py-8 text-center text-slate-400">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  {loadingText}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-8 text-center text-slate-400">
                  {searchQuery
                    ? `No options found for "${searchQuery}"`
                    : emptyText}
                </div>
              ) : (
                filteredOptions.map((option, index) =>
                  renderOption(option, index),
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
