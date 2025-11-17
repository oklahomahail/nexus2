import { CampaignStep } from "./campaignEditor.types";

interface Props {
  step: CampaignStep;
  onNavigate?: (step: CampaignStep) => void;
}

const steps: { id: CampaignStep; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "theme", label: "Theme" },
  { id: "audience", label: "Audience" },
  { id: "deliverables", label: "Deliverables" },
  { id: "review-draft", label: "Review Draft" },
  { id: "publish", label: "Publish" },
];

export default function CampaignStepSidebar({ step, onNavigate }: Props) {
  return (
    <div className="p-6 space-y-4">

      <div className="font-semibold text-[var(--nx-charcoal)] text-lg">
        Campaign Builder
      </div>

      <nav className="space-y-2">
        {steps.map((s) => {
          const isActive = s.id === step;

          return (
            <button
              key={s.id}
              onClick={() => onNavigate?.(s.id)}
              className={`w-full text-left px-3 py-2 rounded
                ${
                  isActive
                    ? "bg-[var(--nx-gold)] text-white font-medium"
                    : "text-[var(--nx-charcoal)] hover:bg-[var(--nx-offwhite)]"
                }
              `}
            >
              {s.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
