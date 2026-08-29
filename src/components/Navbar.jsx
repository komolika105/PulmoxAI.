import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Activity, LogOut, Menu, ScanLine, User, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PRIMARY_LINKS = [
  { to: "/", label: "Dashboard" },
  { to: "/analyze", label: "Analyze X-Ray" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === "/"}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? "text-indigo-700 bg-indigo-50" : "text-slate-600 hover:text-navy hover:bg-slate-50"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md" style={{ borderColor: "var(--color-border)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ backgroundColor: "var(--color-indigo)" }}>
            <Activity size={18} strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
            PulmoXAI
          </span>
        </NavLink>

        <nav className="hidden lg:flex items-center gap-1">
          {PRIMARY_LINKS.map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-teal)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-teal)" }} />
            System Online
          </span>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="flex h-9 w-9 items-center justify-center rounded-full font-semibold text-sm text-white"
                style={{ backgroundColor: "var(--color-indigo)" }}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="Account menu"
              >
                {user?.name?.[0]?.toUpperCase() || <User size={16} />}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white p-1.5 shadow-lg" style={{ borderColor: "var(--color-border)" }}>
                  <p className="px-3 py-2 text-xs truncate" style={{ color: "var(--color-navy-soft)" }}>{user?.email}</p>
                  <NavLink to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <User size={14} /> Profile
                  </NavLink>
                  <button onClick={onLogout} className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50">
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Sign in
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--color-indigo)" }}
              >
                Sign up
              </NavLink>
            </div>
          )}
        </div>

        <button className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1" style={{ borderColor: "var(--color-border)" }}>
          {PRIMARY_LINKS.map((link) => (
            <NavItem key={link.to} {...link} onClick={() => setMobileOpen(false)} />
          ))}
          <div className="border-t pt-2 mt-2 space-y-1" style={{ borderColor: "var(--color-border)" }}>
            {isAuthenticated ? (
              <>
                <NavItem to="/profile" label="Profile" onClick={() => setMobileOpen(false)} />
                <button onClick={onLogout} className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50">
                  <LogOut size={14} /> Log out
                </button>
              </>
            ) : (
              <>
                <NavItem to="/login" label="Sign in" onClick={() => setMobileOpen(false)} />
                <NavItem to="/signup" label="Sign up" onClick={() => setMobileOpen(false)} />
              </>
            )}
            <span className="mt-2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium w-fit" style={{ borderColor: "var(--color-border)", color: "var(--color-teal)" }}>
              <ScanLine size={12} /> System Online
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
