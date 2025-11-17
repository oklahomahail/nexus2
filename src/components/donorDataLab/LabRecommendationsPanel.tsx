import { LabRecommendations } from '@/services/donorDataLab';

type Props = { recs: LabRecommendations };

export function LabRecommendationsPanel({ recs }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-xs">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">
          Strategy Overview
        </h3>
        <p className="mt-1 text-slate-300">{recs.overview}</p>
      </div>

      <Section title="Upgrade strategy" items={recs.upgradeStrategy} />
      <Section title="Monthly giving strategy" items={recs.monthlyStrategy} />
      <Section title="Reactivation strategy" items={recs.reactivationStrategy} />
      <Section title="Lookalike audience strategy" items={recs.lookalikeStrategy} />
      <Section title="Channel & cadence notes" items={recs.channelAndCadenceNotes} />
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>
      <ul className="list-disc space-y-1 pl-4 text-slate-200">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
