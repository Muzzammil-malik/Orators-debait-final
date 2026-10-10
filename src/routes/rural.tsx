import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminAuthService, type AdminSession } from "@/lib/admin-api";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/rural")({
  head: () => ({
    meta: [
      { title: "DE'BAIT 2026 — RURAL OPERATIONAL DESK" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: RuralAdminRoute,
});

function RuralAdminRoute() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setCheckingSession(false);
      return;
    }

    let mounted = true;
    void AdminAuthService.getAdminSession()
      .then((adminSession) => {
        if (mounted) setSession(adminSession);
      })
      .finally(() => {
        if (mounted) setCheckingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (!authSession) {
        setSession(null);
        return;
      }
      window.setTimeout(() => {
        void AdminAuthService.getAdminSession().then((adminSession) => {
          if (mounted) setSession(adminSession);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = async () => {
    setSession(await AdminAuthService.getAdminSession());
  };

  const handleLogout = async () => {
    await AdminAuthService.logout();
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas font-type text-xs uppercase text-mist/70">
        Checking operator session…
      </div>
    );
  }
  if (!session) {
    return <AdminLogin onSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard operatorName={session.username} onLogout={handleLogout} />;
}
