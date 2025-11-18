import { useState } from "react";

import { CampaignStep } from "./campaignEditor.types";
import CampaignStepMobileSidebar from "./CampaignStepMobileSidebar";
import CampaignStepSidebar from "./CampaignStepSidebar";

interface Props {
  step: CampaignStep;
  children: React.ReactNode;
}

export default function CampaignEditorLayout({ step, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 border-r border-[var(--nx-border)] bg-[var(--nx-offwhite)]">
        <CampaignStepSidebar step={step} onNavigate={() => {}} />
      </div>

      {/* Mobile sidebar button */}
      <button
        className="lg:hidden p-4 text-[var(--nx-charcoal)]"
        onClick={() => setMobileMenuOpen(true)}
      >
        Menu
      </button>

      {/* Mobile drawer */}
      <CampaignStepMobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeStep={step}
      />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-8 py-10 editorial-flow">
        {children}
      </div>
    </div>
  );
}
