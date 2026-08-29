import { Info } from "lucide-react";
import { Disclaimer } from "./Disclaimer";
import { classColor, formatPercent, uncertaintyTone } from "../utils/formatters";

export default function PredictionCard({ prediction, confidence, uncertainty, calibrationStatus }) {
  const color = classColor(prediction);
  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--color-border)" }}>
      <p className="font-mono text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-navy-soft)" }}>
        AI Prediction
      </p>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-3xl font-semibold" style={{ color }}>{prediction}</h3>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
          style={{ borderColor: `${color}33`, backgroundColor: `${color}14`, color }}
        >
          Confidence {formatPercent(confidence)}
        </span>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-surface-alt)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(confidence * 100, 100)}%`, backgroundColor: color }}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${uncertaintyTone(uncertainty)}`}>
          Uncertainty: {uncertainty}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-slate-600"
          style={{ borderColor: "var(--color-border)" }}
          title="Confidence represents the model's estimated probability and should not be interpreted as clinical certainty."
        >
          <Info size={12} /> {calibrationStatus}
        </span>
      </div>

      <div className="mt-5">
        <Disclaimer compact />
      </div>
    </div>
  );
}
