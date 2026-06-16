import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { renderMd } from "../utils/renderMd.jsx";
import { useT, detectTextLang } from "../utils/i18n.jsx";
import InlineChat from "./InlineChat";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Case Bias Meter ─────────────────────────────────────────────
const CaseBiasMeter = ({ bias, lang }) => {
  if (!bias) return null;
  const u = Math.round(bias.user_favor ?? 50);
  const o = 100 - u;
  const userLabel  = lang === "ur" ? "آپ کا مؤقف" : lang === "roman-ur" ? "Aapka moqif" : "Your Position";
  const oppLabel   = lang === "ur" ? "مخالف فریق" : lang === "roman-ur" ? "Opponent" : "Opponent";
  const strongSide = u >= 55 ? "user" : u <= 45 ? "opponent" : "neutral";
  const barColor   = strongSide === "user" ? "#0E7A45" : strongSide === "opponent" ? "#DC2626" : "#F59E0B";

  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "18px 20px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      {/* Title */}
      <div style={{ fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>
        {lang === "ur" ? "کیس کا توازن" : lang === "roman-ur" ? "Case Ka Tawazun" : "Case Balance — AI Assessment"}
      </div>

      {/* Split bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#059669", minWidth: 32, textAlign: "right" }}>{u}%</div>
        <div style={{ flex: 1, height: 14, background: "#FEE2E2", borderRadius: 10, overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${u}%`, background: "linear-gradient(90deg, #0E7A45, #10B981)", borderRadius: "10px 0 0 10px", transition: "width 1s ease" }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", minWidth: 32 }}>{o}%</div>
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#059669" }}>✓ {userLabel}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#DC2626" }}>✗ {oppLabel}</span>
      </div>

      {/* Dominant factor */}
      {bias.dominant_factor && (
        <div style={{ background: "#F8FAFB", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#374151", lineHeight: 1.5, borderLeft: `3px solid ${barColor}` }}>
          {bias.dominant_factor}
        </div>
      )}

      {/* Key risk */}
      {bias.key_risk && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#B45309", display: "flex", gap: 6 }}>
          <span>⚠</span><span>{bias.key_risk}</span>
        </div>
      )}
    </div>
  );
};

const LegalGuideTab = ({ lang }) => {
  const { t } = useT();
  const [caseText, setCaseText] = useState("");
  const [status, setStatus]     = useState("idle");   // idle | processing | done
  const [aiResponse, setAiResponse]   = useState(null);
  const [matchedLaws, setMatchedLaws] = useState([]);
  const [accuracy, setAccuracy]       = useState(null);
  const [caseBias, setCaseBias]       = useState(null);
  const [chatContext, setChatContext]  = useState([]);
  const [replyLang, setReplyLang]     = useState("en");
  const [apiOnline, setApiOnline]     = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/`).then(r => setApiOnline(r.ok)).catch(() => setApiOnline(false));
  }, []);

  const handleSubmit = async () => {
    if (!caseText.trim() || status === "processing") return;
    setStatus("processing");
    setAiResponse(null);
    setMatchedLaws([]);
    setAccuracy(null);
    setChatContext([]);

    const detectedLang = lang === "ur" ? "ur" : detectTextLang(caseText);
    setReplyLang(detectedLang);

    if (!apiOnline) {
      // Offline mock
      setTimeout(() => {
        setAiResponse("Backend offline hai. Real AI analysis ke liye backend server chalaein.");
        setStatus("done");
      }, 1200);
      return;
    }

    try {
      const data = await api.chat(caseText, [], detectedLang);
      setAiResponse(data.reply);
      setMatchedLaws((data.matched_laws || []).map(l => ({
        code: l.act_name, section: l.section_num,
        desc: (l.text_en || l.title || "").slice(0, 160) + "…",
        conf: (l.score || 0) >= 50 ? "high" : "med",
        punishment: l.punishment, severity: l.severity,
      })));
      setAccuracy(data.accuracy || null);
      setCaseBias(data.case_bias || null);
      setChatContext([
        { role: "user", content: caseText },
        { role: "assistant", content: data.reply },
      ]);
      setStatus("done");
    } catch {
      setAiResponse("Connection issue — please try again.");
      setStatus("done");
    }
  };

  const reset = () => { setStatus("idle"); setCaseText(""); setAiResponse(null); setMatchedLaws([]); setAccuracy(null); setCaseBias(null); setChatContext([]); };

  return (
    <div className="lg-wrap">
      <div className="lg-header">
        <h1>{t("lg.title")}</h1>
        <p>{t("lg.subtitle")}</p>
      </div>

      {/* Input box */}
      {status === "idle" && (
        <div className="lg-input-box">
          <label>{t("lg.inputLabel")}</label>
          <textarea
            className="lg-textarea"
            value={caseText}
            onChange={e => setCaseText(e.target.value)}
            placeholder={t("lg.placeholder")}
            rows={5}
          />
          <button
            className="lb-btn lb-btn--primary lg-submit"
            onClick={handleSubmit}
            disabled={!caseText.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 8, verticalAlign: "middle" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {t("lg.searchBtn")}
          </button>
        </div>
      )}

      {/* Processing */}
      {status === "processing" && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, #0E7A45, #065F38)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", animation: "pulse 1.5s ease-in-out infinite"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p style={{ color: "#374151", fontWeight: 700, fontSize: 15 }}>LawyerGPT analyze kar raha hai...</p>
          <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>Pakistani law ke mutabiq jawab aa raha hai</p>
        </div>
      )}

      {/* Results */}
      {status === "done" && (
        <div className="lg-result">

          {/* Back button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: 16 }}>
            <button className="lb-btn" style={{ fontSize: 13, padding: "6px 14px" }} onClick={reset}>
              ↩ Naya sawaal
            </button>
          </div>

          {/* Case Strength (keyword-based) — only if no AI bias available */}
          {accuracy && !caseBias && (
            <div className="lg-accuracy-card" style={{ marginBottom: 20 }}>
              <div className="lg-accuracy-left">
                <div className="lg-accuracy-label">{t("lg.winChance")}</div>
                <div className="lg-accuracy-pct">{accuracy.win_pct}<span>%</span></div>
                <div className={`lg-accuracy-badge lg-accuracy-badge--${accuracy.confidence?.toLowerCase()}`}>
                  {accuracy.confidence} {t("lg.confidence")}
                </div>
              </div>
              <div className="lg-accuracy-right">
                <div className="lg-accuracy-bar-wrap">
                  <div className="lg-accuracy-bar" style={{ width: accuracy.win_pct + "%" }} />
                </div>
                <div className="lg-accuracy-note">{accuracy.note}</div>
              </div>
            </div>
          )}

          {/* Case Bias Meter — AI-powered, shows when available */}
          <CaseBiasMeter bias={caseBias} lang={replyLang} />

          {/* AI Response */}
          {aiResponse && (
            <div style={{
              background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12,
              marginBottom: 4, padding: "16px 20px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: "#E8F5EE",
                  border: "1.5px solid #BBE9CE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0E7A45", textTransform: "uppercase", letterSpacing: "0.04em" }}>LawyerGPT</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: "#1F2937" }}>
                {renderMd(aiResponse)}
              </div>
            </div>
          )}

          {/* Matched laws reference */}
          {matchedLaws.length > 0 && (
            <div className="lg-laws" style={{ marginTop: 12 }}>
              <div className="lg-laws-title">{t("lg.matchedLaws")}</div>
              {matchedLaws.map((law, i) => (
                <div key={i} className="lg-law-item">
                  <div className="lg-law-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0E7A45"><path d="M5 3h11l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                      <span className="lg-law-code">{law.code}</span>
                      <span className="lg-law-section">{law.section}</span>
                      <span className={`lg-confidence lg-confidence--${law.conf}`}>{law.conf === "high" ? t("lg.highMatch") : t("lg.possible")}</span>
                      {law.severity && <span className={`lg-confidence lg-confidence--${law.severity === "High" ? "high" : "med"}`}>{law.severity}</span>}
                    </div>
                    <div className="lg-law-desc">{law.desc}</div>
                    {law.punishment && <div style={{ fontSize: 11, color: "#DC2626", fontWeight: 600, marginTop: 3 }}>⚖ Saza: {law.punishment}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline chat for follow-up */}
          <InlineChat
            contextHistory={chatContext}
            replyLang={replyLang}
            lang={lang === "ur" ? "ur" : replyLang}
          />
        </div>
      )}
    </div>
  );
};

export default LegalGuideTab;
