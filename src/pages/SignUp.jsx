import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthError } from "../services/authApi";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await signup(form);
      navigate("/profile", { replace: true });
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
          <UserPlus size={20} />
        </span>
        <h1 className="font-display text-2xl font-semibold" style={{ color: "var(--color-navy)" }}>Create your account</h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-navy-soft)" }}>Save your scan history and revisit past results anytime.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-navy)" }}>Full name</label>
            <input
              id="name" name="name" type="text" required autoComplete="name"
              value={form.name} onChange={onChange}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400"
              style={{ borderColor: "var(--color-border)" }}
            />
          </div>
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
              id="password" name="password" type="password" required autoComplete="new-password" minLength={6}
              value={form.password} onChange={onChange}
              className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400"
              style={{ borderColor: "var(--color-border)" }}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--color-navy-soft)" }}>At least 6 characters.</p>
          </div>

          {error && <p className="text-sm" style={{ color: "var(--color-rose)" }} role="alert">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-indigo)" }}
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-navy-soft)" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium" style={{ color: "var(--color-indigo)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
