import { useState } from "react";

const CASES = [
  { id: "C-001", title: "Makan Maalik vs Kiraya Dar Dispute", cat: "Property", status: "active", date: "15 Jan 2025", progress: 65 },
  { id: "C-002", title: "Employment Termination — Notice Period", cat: "Labor", status: "pending", date: "02 Mar 2025", progress: 30 },
  { id: "C-003", title: "Contract Breach — Construction Agreement", cat: "Civil", status: "closed", date: "10 Nov 2024", progress: 100 },
];

const STATUS_STYLES = {
  active:  { bg: "#DCFCE7", text: "#166534", label: "Active" },
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  closed:  { bg: "#F3F4F6", text: "#374151", label: "Closed" },
};

const MyCasesTab = () => {
  const [filter, setFilter] = useState("all");

  const filtered = CASES.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="cases-wrap" style={{ padding: "32px 36px", maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>My Cases</h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6B7280" }}>Apne qanooni cases track karein</p>
        </div>
        <button className="lb-btn lb-btn--primary" style={{ fontSize: 13 }}>+ New Case</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "active", "pending", "closed"].map((s) => (
          <button key={s} className={`lb-cat${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}
            style={{ textTransform: "capitalize" }}>{s === "all" ? "All" : STATUS_STYLES[s].label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((c) => {
          const st = STATUS_STYLES[c.status];
          return (
            <div key={c.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E5E7EB", padding: "20px 24px", cursor: "pointer", transition: "box-shadow 140ms" }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.07)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, marginBottom: 4 }}>{c.id}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{c.cat} · {c.date}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: st.bg, color: st.text, flexShrink: 0 }}>{st.label}</span>
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
            <p style={{ margin: 0 }}>Koi case nahi mila</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCasesTab;
