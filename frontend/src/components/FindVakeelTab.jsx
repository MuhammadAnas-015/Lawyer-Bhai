import { useState } from "react";
import Icon from "./Icon";
import { useT } from "../utils/i18n.jsx";

const SPEC_KEY = {
  All: "cat.all", Criminal: "cat.criminal", Family: "cat.family",
  Property: "cat.property", Corporate: "fv.corporate", Employment: "fv.employment",
};

const VAKEELS = [
  { name: "Adv. Tariq Mahmood", spec: "Criminal Law", city: "Karachi", exp: "15 yrs", rating: "4.9", cases: 120, initial: "T" },
  { name: "Adv. Sana Mirza", spec: "Family Law", city: "Lahore", exp: "10 yrs", rating: "4.8", cases: 85, initial: "S" },
  { name: "Adv. Bilal Ahmed", spec: "Property Law", city: "Islamabad", exp: "12 yrs", rating: "4.7", cases: 98, initial: "B" },
  { name: "Adv. Fatima Khan", spec: "Employment Law", city: "Karachi", exp: "8 yrs", rating: "4.9", cases: 64, initial: "F" },
  { name: "Adv. Usman Raza", spec: "Corporate Law", city: "Lahore", exp: "20 yrs", rating: "5.0", cases: 200, initial: "U" },
  { name: "Adv. Ayesha Siddiqui", spec: "Criminal Law", city: "Peshawar", exp: "7 yrs", rating: "4.6", cases: 55, initial: "A" },
];

const SPECS = ["All", "Criminal", "Family", "Property", "Corporate", "Employment"];

const FindVakeelTab = () => {
  const { t } = useT();
  const [filter, setFilter] = useState("All");
  const filtered = VAKEELS.filter((v) => filter === "All" || v.spec.includes(filter));

  return (
    <div className="fv-wrap" style={{ padding: "32px 36px", maxWidth: 780 }}>
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>{t("fv.title")}</h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B7280" }}>{t("fv.subtitle")}</p>

      <div className="fv-filter-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {SPECS.map((s) => (
          <button key={s} className={`lb-cat${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>{t(SPEC_KEY[s] || "cat.all")}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.map((v, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #E5E7EB", padding: "20px 22px", transition: "box-shadow 140ms, border-color 140ms", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.09)"; e.currentTarget.style.borderColor = "#BBF7D0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#E5E7EB"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0E7A45,#2EA462)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                {v.initial}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{v.name}</div>
                <div style={{ fontSize: 12, color: "#0E7A45", fontWeight: 600 }}>{v.spec}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="map-pin" size={13} color="#9CA3AF" /> {v.city}
              </span>
              <span>{v.exp} {t("fv.experience")}</span>
              <span>{v.cases} {t("fv.cases")}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="star" size={14} color="#F59E0B" />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{v.rating}</span>
              </div>
              <button className="lb-btn lb-btn--primary" style={{ fontSize: 12, padding: "6px 16px", borderRadius: 10 }}>{t("fv.contact")}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindVakeelTab;
