import { useNavigate } from "react-router-dom";
import { Calendar, LogOut, Mail, ScanLine, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { mockHistory } from "../services/mockData";
import { classColor, formatDate, formatDateTime, formatPercent } from "../utils/formatters";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Your Profile" subtitle="Account details and recent scans." />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="rounded-2xl border bg-white p-6 flex flex-col sm:flex-row sm:items-center gap-5" style={{ borderColor: "var(--color-border)" }}>
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-xl font-semibold text-white"
            style={{ backgroundColor: "var(--color-indigo)" }}
          >
            {user.name?.[0]?.toUpperCase() || <User size={22} />}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl font-semibold" style={{ color: "var(--color-navy)" }}>{user.name}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ color: "var(--color-navy-soft)" }}>
              <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar size={14} /> Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-slate-50"
            style={{ borderColor: "var(--color-border)", color: "var(--color-navy)" }}
          >
            <LogOut size={15} /> Log out
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-semibold" style={{ color: "var(--color-navy)" }}>Recent scans</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--color-navy-soft)" }}>
              <ScanLine size={13} /> Sample data — connects to your account once the backend is live
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockHistory.slice(0, 3).map((item) => {
              const color = classColor(item.prediction);
              return (
                <div key={item.id} className="rounded-2xl border bg-white p-4 flex gap-3" style={{ borderColor: "var(--color-border)" }}>
                  <img src={item.thumbnail} alt="" className="h-14 w-14 shrink-0 rounded-lg border object-cover" style={{ borderColor: "var(--color-border)" }} />
                  <div className="min-w-0">
                    <p className="text-xs" style={{ color: "var(--color-navy-soft)" }}>{formatDateTime(item.date)}</p>
                    <p className="font-display text-sm font-semibold truncate" style={{ color }}>{item.prediction}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-navy-soft)" }}>Confidence {formatPercent(item.confidence)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
