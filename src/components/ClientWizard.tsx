import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui-kit/Button";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-panel border border-border rounded-2xl shadow-md">
        {/* Header with Progress */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4 text-text">Add New Client</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-text transition-colors p-1"
            >
              ×
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-body-sm font-medium transition-all ${
                      currentStep > step.number
                        ? "bg-accent text-white"
                        : currentStep === step.number
                          ? "bg-accent text-white"
                          : "bg-elevated border border-border text-muted"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-body-sm font-medium text-text">
                      {step.title}
                    </div>
                    <div className="text-caption text-muted">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 py-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-h4 text-text mb-4">Organization Details</h3>
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
            <div className="space-y-4">
              <h3 className="text-h4 text-text mb-4">Primary Contact</h3>
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
            <div className="space-y-4">
              <h3 className="text-h4 text-text mb-4">Classification</h3>

              <div className="space-y-3">
                <label className="text-body-sm font-medium text-text">
                  Organization Type
                </label>
                <div className="flex flex-wrap gap-2">
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
                      className={`px-3 py-2 rounded-lg border transition-all ${
                        formData.segment === option.value
                          ? "bg-accent text-white border-accent"
                          : "bg-elevated text-text border-border hover:border-accent/50"
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
                <label className="text-body-sm font-medium text-text">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  placeholder="Any additional notes about this client..."
                  className="w-full px-3 py-2 bg-elevated border border-border rounded-lg text-body text-text placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Save & Close
            </Button>
            <span className="text-caption text-muted">Auto-saved</span>
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
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
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWizard;
