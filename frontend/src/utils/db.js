import { supabase } from "./supabase";

// ─── CASES ─────────────────────────────────────────────────
export const casesDB = {
  list: async () => {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("cases.list", error); return []; }
    return data || [];
  },

  add: async ({ title, description, category, status = "active", progress = 10 }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };
    const { data, error } = await supabase
      .from("cases")
      .insert({ user_id: user.id, title, description, category, status, progress })
      .select()
      .single();
    return { data, error };
  },

  update: async (id, fields) => {
    const { data, error } = await supabase
      .from("cases").update(fields).eq("id", id).select().single();
    return { data, error };
  },

  remove: async (id) => {
    const { error } = await supabase.from("cases").delete().eq("id", id);
    return { error };
  },
};

// ─── DOCUMENTS ─────────────────────────────────────────────
export const docsDB = {
  list: async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("docs.list", error); return []; }
    return data || [];
  },

  add: async ({ file_name, extracted_text, win_pct, matched_laws }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };
    const { data, error } = await supabase
      .from("documents")
      .insert({ user_id: user.id, file_name, extracted_text, win_pct, matched_laws })
      .select()
      .single();
    return { data, error };
  },

  remove: async (id) => {
    const { error } = await supabase.from("documents").delete().eq("id", id);
    return { error };
  },
};
