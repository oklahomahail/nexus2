import { Button } from "@/components/ui-kit/Button";

interface Props {
  showBack?: boolean;
  showNext?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
}

export default function CampaignStepActions({
  showBack = true,
  showNext = true,
  onBack,
  onNext,
  nextLabel = "Next",
}: Props) {
  return (
    <div className="campaign-actions sticky bottom-0 border-t border-[var(--nx-border)] py-4 flex justify-end gap-3 px-6">
      {showBack && (
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
      )}

      {showNext && (
        <Button variant="primary" onClick={onNext}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
