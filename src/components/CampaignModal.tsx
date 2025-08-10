import React, { useState, useEffect } from "react";

import { Campaign } from "../models/campaign";

// Define the form data interface
interface CampaignFormData {
  id?: string;
  name: string;
  description: string;
  goal: string; // Form fields are typically strings
  // Add other form fields as needed
}

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (_data: any) => void;
  initialData?: Partial<CampaignFormData> | Campaign; // Accept either type
  mode: "create" | "edit";
}

// Helper function to convert Campaign to CampaignFormData
const campaignToFormData = (campaign: Campaign): CampaignFormData => {
  return {
    id: campaign.id,
    name: campaign.name || "",
    description: campaign.description || "",
    goal: campaign.goal?.toString() || "", // Handle potential undefined values
    // Add other field conversions as needed
  };
};

// Helper function to check if data is a Campaign object
const isCampaign = (data: any): data is Campaign => {
  return data && typeof data.goal === "number";
};

const CampaignModal: React.FC<CampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    goal: "",
  });

  useEffect(() => {
    if (initialData) {
      // Convert Campaign to form data if needed
      const convertedData = isCampaign(initialData)
        ? campaignToFormData(initialData)
        : (initialData as Partial<CampaignFormData>);

      setFormData({
        name: convertedData.name || "",
        description: convertedData.description || "",
        goal: convertedData.goal || "",
        id: convertedData.id,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        description: "",
        goal: "",
      });
    }
  }, [initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data back to the expected format for the API
    const submitData = {
      ...formData,
      goal: parseFloat(formData.goal), // Convert string back to number
    };

    onSave(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "create" ? "Create Campaign" : "Edit Campaign"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Campaign Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="goal"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Goal Amount
            </label>
            <input
              type="number"
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-wite rounded-md hover:bg-blue-700 transition-colors"
            >
              {mode === "create" ? "Create" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;
