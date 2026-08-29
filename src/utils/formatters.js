export const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
};

export const formatMs = (value) => {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)} ms`;
};

export const formatSeconds = (value) => {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(3)} s`;
};

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const uncertaintyTone = (level) => {
  switch (level) {
    case "Low":
      return "text-teal-700 bg-teal-50 border-teal-200";
    case "Moderate":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "High":
      return "text-rose-700 bg-rose-50 border-rose-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
};

export const classColor = (className) => {
  const map = {
    Normal: "#0E8E7D",
    Pneumonia: "#3654D6",
    Tuberculosis: "#C4324B",
    Other: "#C2760C",
  };
  return map[className] || "#45526B";
};
