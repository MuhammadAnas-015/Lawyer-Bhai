import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://liypzpsioukpprkicqvs.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpeXB6cHNpb3VrcHBya2ljcXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MDY4MDUsImV4cCI6MjA5NjA4MjgwNX0.lOa8tnwH6DRfxrI_dcCMyLJoEifjQL2dtcqysDtWmik";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ─── Auth helpers ───────────────────────────────────────────
export const auth = {
  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { data, error };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Map a Supabase user to our app's { name, email } shape
  toAppUser: (user) => {
    if (!user) return { name: "", email: "" };
    const email = user.email || "";
    const name = user.user_metadata?.full_name
      || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { name, email };
  },
};
