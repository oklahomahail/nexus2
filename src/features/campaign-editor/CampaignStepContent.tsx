interface Props {
  children: React.ReactNode;
}

export default function CampaignStepContent({ children }: Props) {
  return (
    <div className="space-y-8 content-flow animate-fadeIn">{children}</div>
  );
}
