export interface Point {
  date: string;
  value: number;
}
export function toTimeSeries(
  input: Array<{ date: string; value: number }>,
): Point[] {
  return (input ?? []).map((d) => ({ date: d.date, value: d.value }));
}
