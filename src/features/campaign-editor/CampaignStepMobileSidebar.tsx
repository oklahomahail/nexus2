import { CampaignStep } from "./campaignEditor.types";
import CampaignStepSidebar from "./CampaignStepSidebar";

interface Props {
  open: boolean;
  onClose: () => void;
  activeStep: CampaignStep;
}

export default function CampaignStepMobileSidebar({
  open,
  onClose,
  activeStep,
}: Props) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="campaign-backdrop fixed inset-0 bg-black/30 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`campaign-drawer fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-lg
          ${open ? "campaign-drawer-enter-active" : "campaign-drawer-enter"}
        `}
      >
        <div className="p-4 border-b border-[var(--nx-border)] flex items-center justify-between">
          <div className="text-lg font-semibold text-[var(--nx-charcoal)]">
            Steps
          </div>
          <button
            onClick={onClose}
            className="text-[var(--nx-charcoal)]"
          >
            Close
          </button>
        </div>

        <CampaignStepSidebar
          step={activeStep}
          onNavigate={() => onClose()}
        />
      </div>
    </>
  );
}
