import { formatMs, formatSeconds } from "../utils/formatters";

const ROWS = [
  { key: "preprocessing", label: "Preprocessing" },
  { key: "segmentation", label: "Segmentation" },
  { key: "classification", label: "Classification" },
  { key: "xai_generation", label: "XAI Generation" },
];

export default function PerformanceCard({ timings, totalSeconds, modelSizeMb }) {
  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--color-border)" }}>
      <p className="font-display text-base font-semibold mb-1" style={{ color: "var(--color-navy)" }}>Inference Performance</p>
      <p className="text-sm mb-4" style={{ color: "var(--color-navy-soft)" }}>Stage-wise latency for this analysis, as reported by the backend.</p>

      <div className="font-mono text-sm">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-1.5">
            <span style={{ color: "var(--color-navy-soft)" }}>{row.label}</span>
            <span style={{ color: "var(--color-navy)" }}>{formatMs(timings?.[row.key])}</span>
          </div>
        ))}
        <div className="my-2 border-t" style={{ borderColor: "var(--color-border)" }} />
        <div className="flex items-center justify-between py-1.5 font-semibold">
          <span style={{ color: "var(--color-navy)" }}>Total</span>
          <span style={{ color: "var(--color-indigo)" }}>{formatMs(timings?.total)} ({formatSeconds(totalSeconds)})</span>
        </div>
      </div>

      {modelSizeMb && (
        <p className="mt-4 text-xs" style={{ color: "var(--color-navy-soft)" }}>
          Model size: <span className="font-mono">{modelSizeMb} MB</span>
        </p>
      )}
    </div>
  );
}
