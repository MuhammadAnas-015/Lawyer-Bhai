import { useState, useEffect } from "react";
import { api } from "../utils/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MOCK_LAWS = {
  rent: [
    { code: "Rent Restriction Ordinance", section: "General 1", desc: "Landlord cannot evict tenant without valid legal ground.", conf: "high" },
    { code: "Transfer of Property Act 1882", section: "Section 105", desc: "Lease of immovable property rights and obligations.", conf: "high" },
  ],
  employment: [
    { code: "Industrial & Commercial Employment Ordinance 1968", section: "Section 11", desc: "Employer must give 30 days notice before termination.", conf: "high" },
    { code: "Payment of Wages Act 1936", section: "Section 4", desc: "Wages must be paid within 7 days of wage period end.", conf: "high" },
  ],
  default: [
    { code: "Contract Act 1872", section: "Section 73", desc: "Compensation for loss caused by breach of contract.", conf: "med" },
    { code: "Constitution of Pakistan 1973", section: "Article 10-A", desc: "Right to fair trial and due process.", conf: "med" },
  ],
};

const MOCK_ADVICE = {
  rent: "Aapke case mein Rent Restriction Ordinance laagu hota hai. Makan maalik bina notice ke kiraya nahi badha sakta. Rent Controller ke paas complaint file karein.",
  employment: "Aapke employment dispute mein ICEO 1968 laagu hoti hai. Termination ke waqt 30 din ka notice zaroori hai. NIRC mein complaint file karein.",
  default: "Aapke masle mein Contract Act 1872 laagu hoti hai. Tamam documents mahfooz rakhein aur ek tajurbakar vakeel se mashwara karein.",
};

const LegalGuideTab = ({ lang }) => {
  const [caseText, setCaseText] = useState("");
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/`).then((r) => setApiOnline(r.ok)).catch(() => setApiOnline(false));
  }, []);

  const handleSubmit = async () => {
    if (!caseText.trim()) return;
    setStatus("processing");
    setResult(null);

    if (!apiOnline) {
      setTimeout(() => {
        const lower = caseText.toLowerCase();
        const key = lower.includes("rent") || lower.includes("kiraya") ? "rent"
          : lower.includes("naukri") || lower.includes("salary") || lower.includes("job") ? "employment"
          : "default";
        setResult({ mode: "mock", laws: MOCK_LAWS[key], mashwara: MOCK_ADVICE[key], accuracy: null });
        setStatus("done");
      }, 1400);
      return;
    }

    try {
      const data = await api.analyze(caseText);
      const laws = (data.matched_laws || []).map((l) => ({
        code: l.act_name, section: l.section_num,
        desc: (l.text_en || l.title || "").slice(0, 160) + "…",
        conf: (l.score || 0) >= 50 ? "high" : "med",
        punishment: l.punishment, severity: l.severity,
      }));
      setResult({ mode: "api", laws, mashwara: data.advice, accuracy: data.accuracy, disclaimer: data.disclaimer });
      setStatus("done");
    } catch {
      const lower = caseText.toLowerCase();
      const key = lower.includes("rent") || lower.includes("kiraya") ? "rent"
        : lower.includes("naukri") || lower.includes("salary") ? "employment" : "default";
      setResult({ mode: "mock", laws: MOCK_LAWS[key], mashwara: MOCK_ADVICE[key], accuracy: null });
      setStatus("done");
    }
  };

  return (
    <div className="lg-wrap">
      <div className="lg-header">
        <h1>Legal Guide — Mashwara</h1>
        <p>Apna case ya masla describe karein — AI Pakistani laws se match karke aapko mashwara dega</p>
      </div>

      <div className="lg-input-box">
        <label>Apna Masla Likhein</label>
        <textarea className="lg-textarea" value={caseText} onChange={(e) => setCaseText(e.target.value)}
          placeholder="Mithaal: Mera makan maalik bina notice ke kiraya 30% barhana chahta hai…" rows={5} />
        <button className="lb-btn lb-btn--primary lg-submit" onClick={handleSubmit}
          disabled={status === "processing" || !caseText.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 8, verticalAlign: "middle" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          {status === "processing" ? "Dhoondh raha hai…" : "Qanoon Dhundhein"}
        </button>
      </div>

      {status === "processing" && (
        <div className="lg-processing">
          <div className="lg-processing-dot"/><div className="lg-processing-dot"/><div className="lg-processing-dot"/>
          Pakistani laws mein match dhoondha ja raha hai…
        </div>
      )}

      {status === "done" && result && (
        <div className="lg-result">
          {result.accuracy && (
            <div className="lg-accuracy-card">
              <div className="lg-accuracy-left">
                <div className="lg-accuracy-label">Aapke Haq Mein Imkaan</div>
                <div className="lg-accuracy-pct">{result.accuracy.win_pct}<span>%</span></div>
                <div className={`lg-accuracy-badge lg-accuracy-badge--${result.accuracy.confidence.toLowerCase()}`}>
                  {result.accuracy.confidence} Confidence
                </div>
              </div>
              <div className="lg-accuracy-right">
                <div className="lg-accuracy-bar-wrap"><div className="lg-accuracy-bar" style={{ width: result.accuracy.win_pct + "%" }}/></div>
                <div className="lg-accuracy-note">{result.accuracy.note}</div>
              </div>
            </div>
          )}

          <div className="lg-result-head">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <h3>AI Mashwara</h3>
            {result.mode === "mock" && <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 600, marginLeft: 8 }}>⚠ Demo mode</span>}
          </div>
          <div className="lg-mashwara">{result.mashwara}</div>

          {result.laws?.length > 0 && (
            <div className="lg-laws">
              <div className="lg-laws-title">Mutaalliq Qanoon (Matched Laws)</div>
              {result.laws.map((law, i) => (
                <div key={i} className="lg-law-item">
                  <div className="lg-law-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="#0E7A45"><path d="M5 3h11l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/></svg></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                      <span className="lg-law-code">{law.code}</span>
                      <span className="lg-law-section">{law.section}</span>
                      <span className={`lg-confidence lg-confidence--${law.conf}`}>{law.conf === "high" ? "High Match" : "Possible"}</span>
                      {law.severity && <span className={`lg-confidence lg-confidence--${law.severity === "High" ? "high" : "med"}`}>{law.severity}</span>}
                    </div>
                    <div className="lg-law-desc">{law.desc}</div>
                    {law.punishment && <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 600, marginTop: 3 }}>⚖ Saza: {law.punishment}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {result.disclaimer && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12, padding: "8px 12px", background: "#F9FAFB", borderRadius: 8, borderLeft: "3px solid #E5E7EB" }}>⚠ {result.disclaimer}</div>}
        </div>
      )}
    </div>
  );
};

export default LegalGuideTab;
