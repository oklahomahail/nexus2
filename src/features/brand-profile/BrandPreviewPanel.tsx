import { BrandProfile } from "./brandProfile.types";

export const BrandPreviewPanel = ({ profile }: { profile: BrandProfile }) => {
  return (
    <div className="bg-[#FAFAF8] border border-gray-300 rounded-md p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-[#1C1E26]">
        Brand Preview
      </h2>

      <div className="space-y-6">
        {/* Brand Name */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-1">
            Organization
          </h3>
          <p className="text-lg font-medium text-[#1C1E26]">
            {profile.name || (
              <span className="text-gray-400 italic">Not set</span>
            )}
          </p>
        </div>

        {/* Mission */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-1">
            Mission Summary
          </h3>
          <p className="text-sm leading-relaxed text-gray-700">
            {profile.mission || (
              <span className="text-gray-400 italic">
                No mission statement provided yet. Add your organization's
                mission to help AI generate campaigns that align with your
                values.
              </span>
            )}
          </p>
        </div>

        {/* Guidelines URL */}
        {profile.guidelinesUrl && (
          <div>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-1">
              Brand Guidelines
            </h3>
            <a
              href={profile.guidelinesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              View Guidelines →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
