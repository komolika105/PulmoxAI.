import { useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { mockHistory } from "../services/mockData";
import { classColor, formatDateTime, formatMs, formatPercent } from "../utils/formatters";
import { EmptyState } from "../components/LoadingState";
import { History as HistoryIcon, Search, Trash2 } from "lucide-react";

const CLASS_OPTIONS = ["All", "Normal", "Pneumonia", "Tuberculosis", "Other"];
const SORTS = [
  { key: "date_desc", label: "Newest first" },
  { key: "date_asc", label: "Oldest first" },
];

export default function History() {
  const [items, setItems] = useState(mockHistory);
  const [query, setQuery] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [sort, setSort] = useState("date_desc");

  const visible = useMemo(() => {
    let list = items.filter((i) => i.prediction.toLowerCase().includes(query.toLowerCase()));
    if (filterClass !== "All") list = list.filter((i) => i.prediction === filterClass);
    list = [...list].sort((a, b) =>
      sort === "date_desc" ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date)
    );
    return list;
  }, [items, query, filterClass, sort]);

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  return (
    <div>
      <PageHeader eyebrow="History" title="Analysis History" subtitle="Previously analyzed cases from this session. No patient-identifying information is stored." />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-navy-soft)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by prediction..."
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-navy)" }}
          >
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c === "All" ? "All diseases" : c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
            style={{ borderColor: "var(--color-border)", color: "var(--color-navy)" }}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {visible.length === 0 ? (
          <EmptyState icon={HistoryIcon} title="No analyses found" description="Try a different search term or filter." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => {
              const color = classColor(item.prediction);
              return (
                <div key={item.id} className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex gap-3">
                    <img src={item.thumbnail} alt="" className="h-16 w-16 shrink-0 rounded-lg border object-cover" style={{ borderColor: "var(--color-border)" }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs" style={{ color: "var(--color-navy-soft)" }}>{formatDateTime(item.date)}</p>
                      <p className="font-display text-base font-semibold truncate" style={{ color }}>{item.prediction}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-navy-soft)" }}>
                        Confidence {formatPercent(item.confidence)} · {formatMs(item.inference_time * 1000)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <button className="text-xs font-medium" style={{ color: "var(--color-indigo)" }}>View explanation</button>
                    <button onClick={() => remove(item.id)} aria-label="Delete from history" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
