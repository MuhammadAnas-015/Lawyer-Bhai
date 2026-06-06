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

// ─── PROFILE / STATS ───────────────────────────────────────
export const profileDB = {
  // Real counts for the profile stats row
  stats: async () => {
    const [casesRes, docsRes] = await Promise.all([
      supabase.from("cases").select("id, status", { count: "exact" }),
      supabase.from("documents").select("id", { count: "exact" }),
    ]);
    const allCases = casesRes.data || [];
    const activeCases = allCases.filter((c) => c.status === "active").length;
    return {
      documents: docsRes.count ?? (docsRes.data?.length || 0),
      cases: casesRes.count ?? allCases.length,
      activeCases,
    };
  },

  // Profile fields live in auth user_metadata (phone, city)
  get: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const m = user?.user_metadata || {};
    return {
      name: m.full_name || "",
      email: user?.email || "",
      phone: m.phone || "",
      city: m.city || "",
      createdAt: user?.created_at || null,
    };
  },

  update: async ({ name, phone, city }) => {
    const data = {};
    if (name !== undefined) data.full_name = name;
    if (phone !== undefined) data.phone = phone;
    if (city !== undefined) data.city = city;
    const { error } = await supabase.auth.updateUser({ data });
    return { error };
  },

  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  },
};
