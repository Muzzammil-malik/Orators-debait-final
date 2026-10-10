import { isSupabaseConfigured, requireSupabase } from "@/lib/supabase";

export interface AdminSession {
  userId: string;
  username: string;
}

export interface BackendStatus {
  mode: "unconfigured" | "connected";
  label: string;
}

export const AdminAuthService = {
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      return { success: false, error: "Enter your administrator email and password." };
    }
    if (!isSupabaseConfigured) {
      return { success: false, error: "Administrator authentication is not configured." };
    }

    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (error || !data.user) {
      return { success: false, error: error?.message ?? "Authentication failed." };
    }

    const { data: profile, error: profileError } = await client
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (profileError || !profile) {
      await client.auth.signOut();
      return {
        success: false,
        error:
          profileError?.message ?? "This account is not authorized to access the operational desk.",
      };
    }
    return { success: true };
  },

  async getAdminSession(): Promise<AdminSession | null> {
    if (!isSupabaseConfigured) return null;
    const client = requireSupabase();
    const { data, error } = await client.auth.getSession();
    if (error || !data.session) return null;
    const user = data.session.user;
    const { data: profile, error: profileError } = await client
      .from("admin_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (profileError || !profile) {
      await client.auth.signOut();
      return null;
    }
    return { userId: user.id, username: user.email ?? "Administrator" };
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  },

  getBackendStatus(): BackendStatus {
    return isSupabaseConfigured
      ? { mode: "connected", label: "Supabase Connected" }
      : { mode: "unconfigured", label: "Supabase Not Configured" };
  },
};
