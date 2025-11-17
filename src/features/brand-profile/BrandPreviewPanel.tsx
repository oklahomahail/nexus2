import { BrandProfile } from "./brandProfile.types";

export const BrandPreviewPanel = ({ profile }: { profile: BrandProfile }) => {
  return (
    <div className="bg-[#FAFAF8] border border-gray-300 rounded-md p-6 shadow-sm">

      <h2 className="text-xl font-semibold mb-4 text-[#1C1E26]">Brand Preview</h2>

      <div className="space-y-6">

        {/* Brand Name */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-1">
            Organization
          </h3>
          <p className="text-lg font-medium text-[#1C1E26]">
            {profile.name || "Dallas LIFE"}
          </p>
        </div>

        {/* Mission */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-1">
            Mission Summary
          </h3>
          <p className="text-sm leading-relaxed text-gray-700">
            {profile.mission ||
              "Dallas LIFE provides a Christ-centered pathway to recovery and long-term transformation through a comprehensive four-phase residential program that addresses addiction, trauma, mental health, and family stability."}
          </p>
        </div>

        {/* Distinctives */}
        <div>
          <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-1">
            Distinctives
          </h3>
          <ul className="text-sm list-disc ml-5 text-gray-700 space-y-1">
            <li>Longest residential recovery program in North Texas</li>
            <li>Four-phase, ten-month model addressing root causes</li>
            <li>Private rooms for single fathers with children</li>
            <li>Support for intact families and seniors</li>
            <li>Teddy Cares trauma-informed program for children</li>
          </ul>
        </div>

      </div>
    </div>
  );
};
