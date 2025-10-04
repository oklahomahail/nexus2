import React, { useState } from "react";

import {
  DatePicker,
  DateRangePicker,
  Checkbox,
  CheckboxGroup,
  RadioGroup,
  FileUpload,
  Select,
  Button,
} from "../ui-kit";

export const FormComponentsDemo: React.FC = () => {
  // State for all form components
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [singleCheckbox, setSingleCheckbox] = useState(false);
  const [checkboxGroup, setCheckboxGroup] = useState<string[]>([]);
  const [radioValue, setRadioValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectValue, setSelectValue] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Options for checkbox/radio groups
  const campaignTypeOptions = [
    {
      value: "fundraising",
      label: "Fundraising Campaign",
      description: "Raise money for a specific cause",
    },
    {
      value: "awareness",
      label: "Awareness Campaign",
      description: "Spread awareness about an issue",
    },
    {
      value: "volunteer",
      label: "Volunteer Recruitment",
      description: "Recruit volunteers for activities",
    },
    {
      value: "event",
      label: "Event Promotion",
      description: "Promote upcoming events",
    },
  ];

  const priorityOptions = [
    {
      value: "low",
      label: "Low Priority",
      description: "Can wait, not urgent",
    },
    {
      value: "medium",
      label: "Medium Priority",
      description: "Important but not critical",
    },
    {
      value: "high",
      label: "High Priority",
      description: "Urgent and important",
    },
    {
      value: "critical",
      label: "Critical",
      description: "Immediate attention required",
    },
  ];

  const channelOptions = [
    { value: "email", label: "Email Marketing" },
    { value: "social", label: "Social Media" },
    { value: "direct", label: "Direct Mail" },
    { value: "phone", label: "Phone Calls" },
    { value: "events", label: "Events & Meetings" },
  ];

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!singleDate) newErrors.singleDate = "Campaign start date is required";
    if (!startDate || !endDate)
      newErrors.dateRange = "Campaign duration is required";
    if (checkboxGroup.length === 0)
      newErrors.checkboxGroup = "Please select at least one campaign type";
    if (!radioValue) newErrors.radioValue = "Please select a priority level";
    if (files.length === 0)
      newErrors.files = "Please upload at least one campaign asset";
    if (!selectValue)
      newErrors.selectValue = "Please select communication channels";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form Data:", {
        singleDate,
        startDate,
        endDate,
        singleCheckbox,
        checkboxGroup,
        radioValue,
        files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        selectValue,
      });

      alert("Form submitted successfully! Check the console for data.");
    } else {
      alert("Please fix the form errors before submitting.");
    }
  };

  const clearForm = () => {
    setSingleDate(null);
    setStartDate(null);
    setEndDate(null);
    setSingleCheckbox(false);
    setCheckboxGroup([]);
    setRadioValue("");
    setFiles([]);
    setSelectValue("");
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Form Components Demo</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Showcase of advanced form components including DatePicker,
          Checkbox/Radio groups, File Upload with drag-and-drop, and integrated
          validation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date Picker Section */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            📅 Date Selection
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DatePicker
              value={singleDate}
              onChange={setSingleDate}
              label="Campaign Start Date"
              placeholder="Select start date"
              required
              error={errors.singleDate}
              minDate={new Date()}
              format="MM/dd/yyyy"
            />

            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
              label="Campaign Duration"
              placeholder="Select campaign duration"
              required
              error={errors.dateRange}
              minDate={new Date()}
            />
          </div>
        </section>

        {/* Checkbox Section */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            ☑️ Checkbox Components
          </h2>

          <div className="space-y-6">
            <Checkbox
              checked={singleCheckbox}
              onChange={setSingleCheckbox}
              label="Send automated follow-up emails"
              description="Automatically send thank you and follow-up emails to donors"
              size="md"
            />

            <CheckboxGroup
              value={checkboxGroup}
              onChange={setCheckboxGroup}
              options={campaignTypeOptions}
              label="Campaign Types"
              description="Select all campaign types that apply"
              required
              error={errors.checkboxGroup}
              columns={2}
              size="md"
            />
          </div>
        </section>

        {/* Radio Button Section */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            🔘 Radio Button Groups
          </h2>

          <RadioGroup
            value={radioValue}
            onChange={setRadioValue}
            options={priorityOptions}
            name="priority"
            label="Campaign Priority"
            description="Select the priority level for this campaign"
            required
            error={errors.radioValue}
            columns={2}
            size="md"
          />
        </section>

        {/* File Upload Section */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            📁 File Upload
          </h2>

          <FileUpload
            value={files}
            onChange={setFiles}
            label="Campaign Assets"
            description="Upload images, documents, or other campaign materials"
            placeholder="Drop files here or click to browse"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
            multiple={true}
            maxFiles={5}
            maxFileSize={10 * 1024 * 1024} // 10MB
            required
            error={errors.files}
            onError={(error) =>
              setErrors((prev) => ({ ...prev, files: error }))
            }
            showPreview={true}
          />
        </section>

        {/* Select Integration */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-slate-700 pb-2">
            🎯 Communication Channels
          </h2>

          <Select
            options={channelOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={selectValue}
            onChange={setSelectValue}
            label="Communication Channels"
            placeholder="Select communication channels"
            searchable
            multiple={false}
            required
            error={errors.selectValue}
            size="md"
          />
        </section>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-700">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={clearForm}
          >
            Clear Form
          </Button>

          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() =>
                console.log("Current form state:", {
                  singleDate,
                  startDate,
                  endDate,
                  singleCheckbox,
                  checkboxGroup,
                  radioValue,
                  files,
                  selectValue,
                })
              }
            >
              Preview Data
            </Button>

            <Button type="submit" variant="primary" size="lg">
              Submit Campaign
            </Button>
          </div>
        </div>
      </form>

      {/* Component Status */}
      <section className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          ✅ Components Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">DatePicker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">DateRangePicker</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">Checkbox</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">CheckboxGroup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">Radio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">RadioGroup</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-slate-300">FileUpload</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span className="text-slate-300">Select (Enhanced)</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FormComponentsDemo;
