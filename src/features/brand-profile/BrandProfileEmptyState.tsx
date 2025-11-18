import { Palette } from "lucide-react";

interface BrandProfileEmptyStateProps {
  clientName?: string;
  onGetStarted?: () => void;
}

export const BrandProfileEmptyState = ({
  clientName,
  onGetStarted,
}: BrandProfileEmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <Palette size={48} className="text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[#1C1E26]">
            No Brand Profile Yet
          </h2>
          <p className="text-gray-600">
            {clientName ? (
              <>
                <strong>{clientName}</strong> doesn't have a brand profile yet.
              </>
            ) : (
              "This client doesn't have a brand profile yet."
            )}
          </p>
          <p className="text-sm text-gray-500">
            Upload brand guidelines or enter details to help AI generate
            campaigns that align with your organization's identity.
          </p>
        </div>

        {onGetStarted && (
          <button
            onClick={onGetStarted}
            className="bg-[#1C1E26] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-black transition-colors"
          >
            Get Started
          </button>
        )}
      </div>
    </div>
  );
};
