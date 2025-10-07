import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export default function CampaignBuilder() {
  const { clientId: _clientId, campaignId } = useParams();
  const isEdit = !!campaignId;
  const [hasChanges, setHasChanges] = useState(false);
  const dirtyRef = useRef(false);

  // Track if form has unsaved changes
  const handleInputChange = () => {
    setHasChanges(true);
    dirtyRef.current = true;
  };

  const handleSave = () => {
    setHasChanges(false);
    dirtyRef.current = false;
    // Save logic here
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <div className="p-6" data-tutorial-step="campaign.builder">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">
          {isEdit ? "Edit Campaign" : "Create New Campaign"}
        </h1>
        <p className="text-gray-600">
          {isEdit
            ? "Update your campaign details"
            : "Build a new campaign for your organization"}
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter campaign name"
                defaultValue={isEdit ? "End-of-Year Holiday 2025" : ""}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Amount
              </label>
              <input
                type="text"
                className="w-full border rounded-md px-3 py-2"
                placeholder="$0"
                defaultValue={isEdit ? "$75,000" : ""}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2 h-24"
                placeholder="Describe your campaign..."
                defaultValue={
                  isEdit
                    ? "Help us raise funds for our holiday food distribution program."
                    : ""
                }
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type
              </label>
              <select
                className="w-full border rounded-md px-3 py-2"
                onChange={handleInputChange}
              >
                <option value="fundraising">Fundraising</option>
                <option value="awareness">Awareness</option>
                <option value="volunteer">Volunteer Recruitment</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleSave}
              >
                {isEdit ? "Update Campaign" : "Create Campaign"}
                {hasChanges && " *"}
              </button>
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
