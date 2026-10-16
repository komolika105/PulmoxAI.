import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { classColor, formatPercent } from "../utils/formatters";

export default function ProbabilityChart({ probabilities, riskScores, thresholds }) {
  const data = Object.entries(probabilities || {})
    .map(([name, rawProbability]) => ({
      name,
      rawProbability,
      threshold: thresholds?.[name],
      detected: thresholds?.[name] === undefined ? undefined : rawProbability >= thresholds[name],
      value: (riskScores?.[name] ?? rawProbability) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--color-border)" }}>
      <p className="font-display text-base font-semibold mb-1" style={{ color: "var(--color-navy)" }}>
        Disease Probability Distribution
      </p>
      <p className="text-sm mb-4" style={{ color: "var(--color-navy-soft)" }}>
        Independent disease scores mapped to thresholds; raw probabilities remain visible for review.
      </p>
      <div style={{ width: "100%", height: Math.max(data.length * 52, 160) }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
            <CartesianGrid horizontal={false} stroke="var(--color-border)" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#45526B" }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13, fill: "#0B1730" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value, _name, item) => {
                const row = item?.payload;
                const details = row?.threshold === undefined
                  ? `Raw ${formatPercent(row?.rawProbability)}`
                  : `Raw ${formatPercent(row.rawProbability)} · threshold ${formatPercent(row.threshold)}`;
                return [`${Number(value).toFixed(1)}% · ${details}`, "Diagnostic risk"];
              }}
              contentStyle={{ borderRadius: 10, border: "1px solid var(--color-border)", fontSize: 13 }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={classColor(entry.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-navy-soft)" }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: classColor(d.name) }} />
            <span>
              {d.name} — Risk {formatPercent(d.value / 100)} · Raw {formatPercent(d.rawProbability)}
              {d.threshold !== undefined && ` · Threshold ${formatPercent(d.threshold)} · ${d.detected ? "Detected" : "Below threshold"}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
