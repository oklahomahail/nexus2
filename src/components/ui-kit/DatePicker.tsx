import clsx from "clsx";
import React, { useState, useRef, useEffect } from "react";

export interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy-MM-dd";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onChange: (startDate: Date | null, endDate: Date | null) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: "MM/dd/yyyy" | "dd/MM/yyyy" | "yyyy-MM-dd";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Calendar component for date selection
interface CalendarProps {
  selectedDate?: Date | null;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  isRange?: boolean;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  selectedStartDate,
  selectedEndDate,
  onDateSelect,
  minDate,
  maxDate,
  isRange,
  currentMonth,
  onMonthChange,
}) => {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (isRange) {
      if (!selectedStartDate && !selectedEndDate) return false;
      if (
        selectedStartDate &&
        date.toDateString() === selectedStartDate.toDateString()
      )
        return true;
      if (
        selectedEndDate &&
        date.toDateString() === selectedEndDate.toDateString()
      )
        return true;
      return false;
    }
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isDateInRange = (date: Date) => {
    if (!isRange || !selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    onMonthChange(newMonth);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="w-64 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-white">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={() => navigateMonth("next")}
          className="p-1 text-slate-400 hover:text-white transition-colors"
        >
          →
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <div key={index} className="text-xs text-slate-400 text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => (
          <div key={index} className="aspect-square">
            {date ? (
              <button
                onClick={() => !isDateDisabled(date) && onDateSelect(date)}
                disabled={isDateDisabled(date)}
                className={clsx(
                  "w-full h-full text-xs rounded transition-colors",
                  {
                    // Today styling
                    "bg-blue-600 text-white":
                      isToday(date) && !isDateSelected(date),
                    // Selected styling
                    "bg-blue-500 text-white": isDateSelected(date),
                    // In range styling (for date range picker)
                    "bg-blue-200/10 text-blue-300": isDateInRange(date),
                    // Default styling
                    "text-slate-300 hover:bg-slate-700":
                      !isDateSelected(date) &&
                      !isToday(date) &&
                      !isDateInRange(date),
                    // Disabled styling
                    "text-slate-600 cursor-not-allowed": isDateDisabled(date),
                  },
                )}
              >
                {date.getDate()}
              </button>
            ) : (
              <div />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Utility functions
const formatDate = (
  date: Date | null,
  format: string = "MM/dd/yyyy",
): string => {
  if (!date) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  switch (format) {
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    default:
      return `${month}/${day}/${year}`;
  }
};

// Single Date Picker Component
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  label,
  required,
  disabled,
  error,
  minDate,
  maxDate,
  format = "MM/dd/yyyy",
  size = "md",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-slate-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "w-full text-left bg-slate-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          sizeClasses[size],
          error
            ? "border-red-500 text-red-300"
            : "border-slate-700 text-white hover:border-slate-600",
          disabled && "opacity-50 cursor-not-allowed bg-slate-800",
        )}
      >
        <div className="flex items-center justify-between">
          <span className={value ? "text-white" : "text-slate-400"}>
            {value ? formatDate(value, format) : placeholder}
          </span>
          <span className="text-slate-400">📅</span>
        </div>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0">
          <Calendar
            selectedDate={value}
            onDateSelect={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

// Date Range Picker Component
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholder = "Select date range",
  label,
  required,
  disabled,
  error,
  minDate,
  maxDate,
  format = "MM/dd/yyyy",
  size = "md",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());
  const [selectingEnd, setSelectingEnd] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    if (!startDate || selectingEnd) {
      // If we're selecting end date or no start date yet
      if (startDate && date < startDate) {
        // If selected date is before start date, make it the new start date
        onChange(date, startDate);
        setSelectingEnd(false);
      } else {
        onChange(startDate || null, date);
        setSelectingEnd(false);
        setIsOpen(false);
      }
    } else {
      // Selecting start date
      onChange(date, null);
      setSelectingEnd(true);
    }
  };

  const displayText = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate, format)} - ${formatDate(endDate, format)}`;
    } else if (startDate) {
      return formatDate(startDate, format);
    }
    return placeholder;
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-2 text-slate-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          "w-full text-left bg-slate-800 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          sizeClasses[size],
          error
            ? "border-red-500 text-red-300"
            : "border-slate-700 text-white hover:border-slate-600",
          disabled && "opacity-50 cursor-not-allowed bg-slate-800",
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={startDate || endDate ? "text-white" : "text-slate-400"}
          >
            {displayText()}
          </span>
          <span className="text-slate-400">📅</span>
        </div>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0">
          <Calendar
            selectedStartDate={startDate}
            selectedEndDate={endDate}
            onDateSelect={handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            isRange={true}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
          {startDate && !endDate && (
            <div className="mt-2 p-2 text-xs text-slate-400 text-center bg-slate-800 border border-slate-700 rounded">
              Select end date
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default DatePicker;
