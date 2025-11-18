import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import Input from "@/components/ui-kit/Input";

interface ClientWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (clientData: ClientFormData) => void;
}

interface ClientFormData {
  // Step 1: Basics
  name: string;
  shortName?: string;
  website?: string;

  // Step 2: Contacts
  primaryContact: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };

  // Step 3: Segmentation
  segment: "nonprofit" | "education" | "government" | "";
  budget?: string;
  notes?: string;
}

const ClientWizard: React.FC<ClientWizardProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    shortName: "",
    website: "",
    primaryContact: {
      name: "",
      email: "",
      phone: "",
      title: "",
    },
    segment: "",
    budget: "",
    notes: "",
  });

  if (!open) return null;

  const steps = [
    { number: 1, title: "Basics", description: "Organization details" },
    { number: 2, title: "Contacts", description: "Primary contact info" },
    { number: 3, title: "Segmentation", description: "Classification & notes" },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<ClientFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateContactData = (
    updates: Partial<ClientFormData["primaryContact"]>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      primaryContact: { ...prev.primaryContact, ...updates },
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name;
      case 2:
        return (
          !!formData.primaryContact.name && !!formData.primaryContact.email
        );
      case 3:
        return !!formData.segment;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl">
        {/* Header with Progress */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-slate-900">
              Add New Client
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 text-3xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      currentStep > step.number
                        ? "bg-blue-600 text-white shadow-sm"
                        : currentStep === step.number
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border-2 border-slate-300 text-slate-400"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3">
                    <div
                      className={`text-sm font-semibold ${
                        currentStep >= step.number
                          ? "text-slate-900"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-slate-300 mx-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6 bg-white">
          {currentStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Organization Details
              </h3>
              <Input
                label="Organization Name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                placeholder="Enter the full organization name"
              />
              <Input
                label="Short Name (Optional)"
                value={formData.shortName}
                onChange={(e) => updateFormData({ shortName: e.target.value })}
                placeholder="Acronym or abbreviated name"
                hint="This will be used in lists and reports"
              />
              <Input
                label="Website (Optional)"
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData({ website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Primary Contact
              </h3>
              <Input
                label="Contact Name"
                value={formData.primaryContact.name}
                onChange={(e) => updateContactData({ name: e.target.value })}
                placeholder="Full name"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.primaryContact.email}
                onChange={(e) => updateContactData({ email: e.target.value })}
                placeholder="email@organization.com"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Phone (Optional)"
                  type="tel"
                  value={formData.primaryContact.phone}
                  onChange={(e) => updateContactData({ phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
                <Input
                  label="Title (Optional)"
                  value={formData.primaryContact.title}
                  onChange={(e) => updateContactData({ title: e.target.value })}
                  placeholder="CEO, Director, etc."
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Classification
              </h3>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Organization Type
                </label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "nonprofit", label: "Nonprofit" },
                    { value: "education", label: "Education" },
                    { value: "government", label: "Government" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        updateFormData({ segment: option.value as any })
                      }
                      className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                        formData.segment === option.value
                          ? "bg-blue-600 text-white border-2 border-blue-600 shadow-sm"
                          : "bg-white text-slate-700 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Estimated Budget (Optional)"
                value={formData.budget}
                onChange={(e) => updateFormData({ budget: e.target.value })}
                placeholder="$10,000 - $50,000"
                hint="Annual marketing or project budget range"
              />

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  placeholder="Any additional notes about this client..."
                  className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2.5 rounded-xl font-medium text-slate-700 bg-white border-2 border-slate-300 hover:bg-slate-50 transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="inline-flex items-center px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {currentStep === 3 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Client
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWizard;
