import { useState } from "react";
import { Lock, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import { AdminAuthService } from "@/lib/admin-api";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await AdminAuthService.login(username, key);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Authentication failed. Please verify credentials.");
      }
    } catch {
      setError("Unable to connect to authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-canvas px-4 py-12 text-mist">
      <div className="w-full max-w-md border-4 border-line bg-surface p-6 shadow-[8px_8px_0_rgba(216,27,114,0.4)] md:p-8">
        {/* Header */}
        <div className="border-b-2 border-line pb-5">
          <div className="flex items-center justify-between">
            <span className="font-type text-xs uppercase tracking-widest text-sun">
              DE&apos;BAIT 2026
            </span>
            <span className="flex items-center gap-1.5 border border-hot/50 bg-hot/10 px-2 py-0.5 font-type text-[10px] uppercase tracking-wider text-hot">
              <Lock size={11} /> RESTRICTED
            </span>
          </div>
          <h1 className="display mt-2 text-4xl text-paper tracking-wide">
            RURAL <span className="text-hot">— ADMIN</span>
          </h1>
          <p className="mt-1 font-type text-xs text-mist/60 uppercase tracking-wider">
            Operational Tournament Desk
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-5 border border-line bg-surface-raised p-3 text-xs font-serif text-mist/80">
          <p className="flex items-start gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-sun" />
            <span>
              Authorized tournament operators only. Authenticate to manage live rounds, official
              judge marks, and team rosters.
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 border border-destructive bg-destructive/10 p-3 font-type text-xs text-paper">
              <AlertCircle size={15} className="shrink-0 text-hot" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="rural-operator"
              className="block font-type text-xs uppercase tracking-wider text-mist/80"
            >
              Administrator Email
            </label>
            <input
              id="rural-operator"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full border-2 border-line bg-canvas px-3.5 py-2.5 font-mono text-sm text-paper placeholder:text-mist/30 focus:border-sun focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="rural-key"
              className="block font-type text-xs uppercase tracking-wider text-mist/80"
            >
              Administrator Password
            </label>
            <input
              id="rural-key"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1.5 w-full border-2 border-line bg-canvas px-3.5 py-2.5 font-mono text-sm text-paper placeholder:text-mist/30 focus:border-sun focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 border-2 border-hot bg-hot py-3 font-type text-xs font-bold uppercase tracking-widest text-paper shadow-[4px_4px_0_var(--line)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Enter Operational Desk"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 border-t border-line/50 pt-4 text-center font-type text-[10px] uppercase tracking-wider text-mist/50">
          DE&apos;BAIT Tournament Engine · Private Route
        </div>
      </div>
    </div>
  );
}
