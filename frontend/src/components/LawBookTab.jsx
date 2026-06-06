import { useState } from "react";
import { useT } from "../utils/i18n.jsx";

const CAT_KEY = {
  All: "cat.all", Criminal: "cat.criminal", Civil: "cat.civil",
  Constitutional: "cat.constitutional", Family: "cat.family",
  Property: "cat.property", Labor: "cat.labor",
};

const BOOKS = [
  { name: "Pakistan Penal Code", year: "1860", cat: "Criminal", desc: "Pakistan ka bunyadi criminal law — crimes aur unki sazaon ka mukamal collection.", sections: ["Sec 302", "Sec 420", "Sec 506", "Sec 354"] },
  { name: "Constitution of Pakistan", year: "1973", cat: "Constitutional", desc: "Pakistan ki aala qanoon — bunyadi huqooq, sarkaari aamal, aur adalati nizam.", sections: ["Art 9", "Art 10-A", "Art 14", "Art 25"] },
  { name: "Contract Act", year: "1872", cat: "Civil", desc: "Tamaim agreements aur muahidon ke liye bunyadi qanoon.", sections: ["Sec 2", "Sec 10", "Sec 73", "Sec 74"] },
  { name: "Rent Restriction Ordinance", year: "1959", cat: "Property", desc: "Makan ya dukan ke kiraye aur kiray dar ke huqooq ka protection.", sections: ["Sec 4", "Sec 9", "Sec 15"] },
  { name: "Family Laws Ordinance", year: "1961", cat: "Family", desc: "Nikah, talaq, maintenance aur bachon ki custody ke ahkam.", sections: ["Sec 4", "Sec 6", "Sec 7", "Sec 9"] },
  { name: "Industrial Employment Ordinance", year: "1968", cat: "Labor", desc: "Mulazmat ke shart-o-sharait, termination aur notice period ke qawaneen.", sections: ["Sec 10", "Sec 11", "Sec 12"] },
  { name: "Transfer of Property Act", year: "1882", cat: "Property", desc: "Jaidad ki kharidd o farokht, mortgage, lease aur hiba ke qawaneen.", sections: ["Sec 54", "Sec 58", "Sec 105", "Sec 122"] },
  { name: "Code of Criminal Procedure", year: "1898", cat: "Criminal", desc: "Form darj karne se le kar mukadame ke faisle tak ka poora procedure.", sections: ["Sec 154", "Sec 496", "Sec 497"] },
  { name: "PECA", year: "2016", cat: "Criminal", desc: "Saibar juraaim — online harassment, fake news aur cyber stalking ke qawaneen.", sections: ["Sec 20", "Sec 21", "Sec 26"] },
];

const CATS = ["All", "Criminal", "Civil", "Constitutional", "Family", "Property", "Labor"];

const CAT_COLORS = {
  Criminal: { bg: "#FEE2E2", text: "#991B1B" },
  Civil: { bg: "#DBEAFE", text: "#1E40AF" },
  Constitutional: { bg: "#DCFCE7", text: "#166534" },
  Family: { bg: "#FEF3C7", text: "#92400E" },
  Property: { bg: "#F3E8FF", text: "#6B21A8" },
  Labor: { bg: "#E0F2FE", text: "#0C4A6E" },
};

const LawBookTab = () => {
  const { t } = useT();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = BOOKS.filter((b) =>
    (cat === "All" || b.cat === cat) &&
    (b.name.toLowerCase().includes(search.toLowerCase()) || b.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="lb-tab">
      <h1>{t("lb.title")}</h1>
      <p>{t("lb.subtitle")}</p>

      <div className="lb-search-row">
        <input className="lb-search" placeholder={t("lb.search")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="lb-cat-row">
        {CATS.map((c) => (
          <button key={c} className={`lb-cat${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{t(CAT_KEY[c] || "cat.all")}</button>
        ))}
      </div>

      <div className="lb-law-list">
        {filtered.map((book, i) => {
          const color = CAT_COLORS[book.cat] || { bg: "#F3F4F6", text: "#374151" };
          return (
            <div key={i} className="lb-law-card" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{book.name}</span>
                    <span style={{ fontSize: 12, color: "#6B7280" }}>{book.year}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: color.bg, color: color.text }}>{book.cat}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{book.desc}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" style={{ transform: expanded === i ? "rotate(90deg)" : "none", transition: "transform 200ms", flexShrink: 0, marginTop: 2 }}><path d="m9 18 6-6-6-6"/></svg>
              </div>
              {expanded === i && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6", display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {book.sections.map((s) => (
                    <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8, background: "#F0FDF4", color: "#0E7A45", border: "1px solid #BBF7D0" }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LawBookTab;
