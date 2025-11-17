import { useState } from "react";
import { BrandProfileLayout } from "./BrandProfileLayout";
import { BrandForm } from "./BrandForm";
import { BrandPreviewPanel } from "./BrandPreviewPanel";
import { BrandProfile } from "./brandProfile.types";

export default function BrandProfilePage() {
  const [profile, setProfile] = useState<BrandProfile>({
    name: "",
    mission: "",
    guidelinesUrl: "",
  });

  return (
    <BrandProfileLayout
      left={<BrandForm profile={profile} setProfile={setProfile} />}
      right={<BrandPreviewPanel profile={profile} />}
    />
  );
}
