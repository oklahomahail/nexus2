export interface Insight {
  text: string;
  confidence: number;
}
export interface InsightRequest {
  scope: "org" | "client" | "campaign";
  scopeId?: string | null;
  metrics: Record<string, number>;
}
const ENABLED = import.meta.env.VITE_ENABLE_INSIGHTS === "true";

export async function getSuggestions(req: InsightRequest): Promise<Insight[]> {
  if (!ENABLED) return [];
  const { totalRaised = 0, donorCount = 0 } = req.metrics;
  const avg = donorCount ? Math.round(totalRaised / donorCount) : 0;
  return [
    {
      text: `Consider a donor reactivation touch; avg gift ≈ $${avg}.`,
      confidence: 0.62,
    },
    { text: `Run a 10% send-time test on top channel.`, confidence: 0.55 },
    {
      text: `Set a +10% stretch to $${Math.round(totalRaised * 1.1)}.`,
      confidence: 0.58,
    },
  ];
}
