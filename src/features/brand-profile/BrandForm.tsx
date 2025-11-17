import { BrandProfile } from "./brandProfile.types";
import { UploadBrandFile } from "./UploadBrandFile";

interface BrandFormProps {
  profile: BrandProfile;
  setProfile: (p: BrandProfile) => void;
}

export const BrandForm = ({ profile, setProfile }: BrandFormProps) => {
  const handleAutoFill = (data: Partial<BrandProfile>) => {
    setProfile({ ...profile, ...data });
  };

  return (
    <div className="space-y-10">

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1C1E26] mb-4">
          Brand Profile
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Define your organization's identity for AI-generated campaigns.
        </p>

        {/* Upload Section */}
        <UploadBrandFile onAutoFill={handleAutoFill} />
      </div>

      {/* Brand Name */}
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Brand Name
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm"
          placeholder="Your organization name"
        />
      </div>

      {/* Mission Statement */}
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Mission Statement
        </label>
        <textarea
          value={profile.mission}
          onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
          className="w-full h-32 border border-gray-300 rounded-sm px-3 py-2 text-sm"
          placeholder="A concise statement of your organization's purpose and impact."
        />
      </div>

      {/* Guidelines URL */}
      <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
        <label className="block text-sm font-medium mb-2 text-gray-800">
          Brand Guidelines URL (optional)
        </label>
        <input
          type="url"
          value={profile.guidelinesUrl ?? ""}
          onChange={(e) => setProfile({ ...profile, guidelinesUrl: e.target.value })}
          className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm"
          placeholder="https://your-brand-guide.com"
        />
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button className="bg-[#1C1E26] text-white px-5 py-2 rounded-sm text-sm font-medium hover:bg-black">
          Save Changes
        </button>
      </div>

    </div>
  );
};
