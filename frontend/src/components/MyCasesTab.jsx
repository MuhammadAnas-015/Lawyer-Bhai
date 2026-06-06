import { useState, useEffect } from "react";
import { casesDB } from "../utils/db";

const STATUS_STYLES = {
  active:  { bg: "#DCFCE7", text: "#166534", label: "Active" },
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  closed:  { bg: "#F3F4F6", text: "#374151", label: "Closed" },
};

const CATEGORIES = ["General", "Criminal", "Civil", "Family", "Property", "Labor", "Consumer"];

const fmtDate = (iso) => {
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return ""; }
};

const MyCasesTab = () => {
  const [filter, setFilter] = useState("all");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New case form
  const [form, setForm] = useState({ title: "", description: "", category: "General", status: "active" });

  const load = async () => {
    setLoading(true);
    const data = await casesDB.list();
    setCases(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const { error } = await casesDB.add({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      progress: form.status === "closed" ? 100 : form.status === "pending" ? 30 : 15,
    });
    setSaving(false);
    if (!error) {
      setShowModal(false);
      setForm({ title: "", description: "", category: "General", status: "active" });
      load();
    } else {
      alert("Case save nahi hua. Dobara koshish karein.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Ye case delete karna hai?")) return;
    setCases((c) => c.filter((x) => x.id !== id)); // optimistic
    await casesDB.remove(id);
  };

  const cycleStatus = async (c) => {
    const next = c.status === "active" ? "pending" : c.status === "pending" ? "closed" : "active";
    const prog = next === "closed" ? 100 : next === "pending" ? 30 : 15;
    setCases((arr) => arr.map((x) => x.id === c.id ? { ...x, status: next, progress: prog } : x));
    await casesDB.update(c.id, { status: next, progress: prog });
  };

  const filtered = cases.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="cases-wrap" style={{ padding: "32px 36px", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>My Cases</h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6B7280" }}>Apne qanooni cases track karein</p>
        </div>
        <button className="lb-btn lb-btn--primary" style={{ fontSize: 13 }} onClick={() => setShowModal(true)}>+ New Case</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "active", "pending", "closed"].map((s) => (
          <button key={s} className={`lb-cat${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}
            style={{ textTransform: "capitalize" }}>{s === "all" ? "All" : STATUS_STYLES[s].label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9CA3AF" }}>
          <div className="char-3d-spinner" style={{ margin: "0 auto 12px" }} />
          Cases load ho rahe hain…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c) => {
            const st = STATUS_STYLES[c.status] || STATUS_STYLES.active;
            return (
              <div key={c.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E5E7EB", padding: "20px 24px", transition: "box-shadow 140ms" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{c.title}</div>
                    {c.description && <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3, lineHeight: 1.4 }}>{c.description}</div>}
                    <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>{c.category} · {fmtDate(c.created_at)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    <span onClick={() => cycleStatus(c)} title="Status change karne ke liye click karein"
                      style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: st.bg, color: st.text, cursor: "pointer" }}>{st.label}</span>
                    <button onClick={() => handleDelete(c.id)} title="Delete"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", fontSize: 12, fontWeight: 600, padding: 0 }}>Delete</button>
                  </div>
                </div>
                <div style={{ height: 6, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${c.progress}%`, background: c.status === "closed" ? "#9CA3AF" : "#0E7A45", borderRadius: 99, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{c.progress}% complete</div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#9CA3AF" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12 }}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Abhi koi case nahi</p>
              <p style={{ margin: 0, fontSize: 13 }}>"+ New Case" se apna pehla case add karein</p>
            </div>
          )}
        </div>
      )}

      {/* New Case Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Naya Case</h2>

            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Case Title *</label>
            <input className="lb-input" style={{ width: "100%", marginBottom: 14 }} placeholder="Mithaal: Makan maalik kiraya dispute"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />

            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Tafseel (optional)</label>
            <textarea style={{ width: "100%", minHeight: 70, padding: "10px 14px", border: "1.5px solid #D1D5DB", borderRadius: 10, fontFamily: "inherit", fontSize: 14, resize: "vertical", marginBottom: 14, boxSizing: "border-box" }}
              placeholder="Case ke baare mein…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Category</label>
                <select className="lb-input" style={{ width: "100%" }} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Status</label>
                <select className="lb-input" style={{ width: "100%" }} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="lb-btn" style={{ flex: 1, background: "#F3F4F6", color: "#374151" }} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="lb-btn lb-btn--primary" style={{ flex: 1 }} onClick={handleAdd} disabled={saving || !form.title.trim()}>
                {saving ? "Saving…" : "Add Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCasesTab;
