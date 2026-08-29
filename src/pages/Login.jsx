import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthError } from "../services/authApi";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || "/profile", { replace: true });
    } catch (err) {
      setError(err instanceof AuthError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-2xl border bg-white p-8" style={{ borderColor: "var(--color-border)" }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl mb-5" style={{ backgroundColor: "var(--color-indigo-mist)", color: "var(--color-indigo)" }}>
          <LogIn size={20} />
        </span>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--color-navy)" }}>Welcome back</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-navy-soft)" }}>Sign in to view your scan history and profile.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-navy)" }}>Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              value={form.email} onChange={onChange}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-navy)" }}>Password</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              value={form.password} onChange={onChange}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--color-rose)" }} role="alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-indigo)" }}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-navy-soft)" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium" style={{ color: "var(--color-indigo)" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
