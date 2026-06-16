import { useState, useRef } from "react";
import { api } from "../utils/api";
import { renderMd } from "../utils/renderMd.jsx";
import InlineChat from "./InlineChat";
import Icon from "./Icon";
import { useT } from "../utils/i18n.jsx";

const detectLang = (text) => {
  if (/[؀-ۿ]/.test(text)) return "ur";
  const words = text.toLowerCase().split(/\s+/);
  const romanUrdu = ["mera","meri","kya","kaise","aap","mein","nahi","masla","nikah","kiraya","hota","hoti","karna","chahiye","wala","raha","rahi","gaya","hum","tum","woh","yeh","lekin","agar","bhi","sirf"];
  return words.filter(w => romanUrdu.includes(w)).length >= 3 ? "roman-ur" : "en";
};

// ── Document Score Card ──────────────────────────────────────────
const GRADE_COLOR = { A: "#059669", "A-": "#059669", "B+": "#0E7A45", B: "#10B981",
  "B-": "#F59E0B", "C+": "#F59E0B", C: "#EF4444", D: "#DC2626" };

const CriteriaBar = ({ label, value, color = "#0E7A45" }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, fontWeight: 600, color: "#374151" }}>
      <span>{label}</span><span style={{ color }}>{value}%</span>
    </div>
    <div style={{ height: 7, background: "#E5E7EB", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 6, transition: "width 0.8s ease" }} />
    </div>
  </div>
);

const DocumentScoreCard = ({ docScore }) => {
  if (!docScore) return null;
  const gradeColor = GRADE_COLOR[docScore.grade] || "#6B7280";
  const getBarColor = (v) => v >= 75 ? "#059669" : v >= 55 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "18px 20px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        <div style={{ textAlign: "center", minWidth: 70 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>{docScore.grade}</div>
          <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 700, marginTop: 2 }}>GRADE</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#111827" }}>{docScore.document_type}</div>
          <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{docScore.verdict}</div>
          <div style={{ marginTop: 6, background: "#F3F4F6", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${docScore.overall}%`, background: gradeColor, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Overall: {docScore.overall}%</div>
        </div>
      </div>
      {/* 4 criteria */}
      <CriteriaBar label="Completeness" value={docScore.completeness} color={getBarColor(docScore.completeness)} />
      <CriteriaBar label="Legal Validity" value={docScore.legal_validity} color={getBarColor(docScore.legal_validity)} />
      <CriteriaBar label="Clarity" value={docScore.clarity} color={getBarColor(docScore.clarity)} />
      <CriteriaBar label="Enforceability" value={docScore.enforceability} color={getBarColor(docScore.enforceability)} />
      {/* Strengths & weaknesses */}
      {(docScore.strengths?.length > 0 || docScore.weaknesses?.length > 0) && (
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          {docScore.strengths?.length > 0 && (
            <div style={{ flex: 1, background: "#F0FDF4", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#059669", marginBottom: 6 }}>✓ STRENGTHS</div>
              {docScore.strengths.map((s, i) => <div key={i} style={{ fontSize: 12, color: "#166534", marginBottom: 3 }}>• {s}</div>)}
            </div>
          )}
          {docScore.weaknesses?.length > 0 && (
            <div style={{ flex: 1, background: "#FFF7ED", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#D97706", marginBottom: 6 }}>⚠ WEAKNESSES</div>
              {docScore.weaknesses.map((w, i) => <div key={i} style={{ fontSize: 12, color: "#92400E", marginBottom: 3 }}>• {w}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DocsTab = ({ lang }) => {
  const { t } = useT();
  const [status, setStatus]       = useState("idle");    // idle | uploading | analyzing | done
  const [ocrData, setOcrData]     = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [chatContext, setChatContext] = useState([]);
  const [replyLang, setReplyLang] = useState("en");
  const [dragOver, setDragOver]   = useState(false);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setStatus("uploading");
    setOcrData(null);
    setAiAnalysis(null);
    setChatContext([]);

    let ocr = null;
    try {
      ocr = await api.ocr(file);
      setOcrData({ file: file.name, ...ocr });
    } catch {
      setOcrData({ file: file.name, mode: "mock" });
      setStatus("done");
      return;
    }

    // Step 2: AI analysis of the extracted text
    setStatus("analyzing");
    const extractedText = ocr.extracted_text || "";
    // Always use the app's UI language — document's own language is irrelevant to response language
    const detectedLang = lang || "en";
    setReplyLang(detectedLang);

    const docPrompt = `Please analyze this legal document and tell me: what type of document it is, what legal rights or obligations it creates, any red flags or issues you notice, and what the person holding this document should know or do.\n\nDocument content:\n${extractedText.slice(0, 2000)}`;

    try {
      const data = await api.chat(docPrompt, [], detectedLang);
      setAiAnalysis(data.reply);
      setChatContext([
        { role: "user", content: docPrompt },
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setAiAnalysis(null);
    }
    setStatus("done");
  };

  const reset = () => { setStatus("idle"); setOcrData(null); setAiAnalysis(null); setChatContext([]); };

  return (
    <div className="docs-wrap">
      <h1>{t("docs.title")}</h1>

      {/* ── Upload zone ── */}
      {status === "idle" && (
        <div
          className={`upload-zone${dragOver ? " upload-zone--drag" : ""}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
        >
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.webp"
            style={{ display: "none" }} onChange={(e) => processFile(e.target.files[0])} />
          <div className="upload-icon"><Icon name="upload-cloud" size={26} color="#0E7A45" /></div>
          <h3>{t("docs.upload")}</h3>
          <p>{t("docs.uploadDesc")}</p>
          <button className="lb-btn lb-btn--primary" style={{ marginTop: 18 }}
            onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
            {t("docs.selectFile")}
          </button>
        </div>
      )}

      {/* ── Uploading spinner ── */}
      {status === "uploading" && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="char-3d-spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#6B7280", fontWeight: 600 }}>{t("docs.processing")}</p>
          <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>Document scan ho raha hai...</p>
        </div>
      )}

      {/* ── AI analyzing spinner ── */}
      {status === "analyzing" && (
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
          <p style={{ color: "#374151", fontWeight: 700, fontSize: 15 }}>LawyerGPT document analyze kar raha hai...</p>
          <p style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>AI se legal analysis aa rahi hai</p>
        </div>
      )}

      {/* ── Results ── */}
      {status === "done" && ocrData && (
        <div className="docs-results">

          {/* File + actions header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E8F5EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#0E7A45"><path d="M5 3h11l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{ocrData.file}</div>
                {ocrData.char_count && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{ocrData.char_count} characters extracted</div>}
              </div>
            </div>
            <button className="lb-btn" style={{ marginLeft: "auto", fontSize: 13, padding: "6px 14px" }} onClick={reset}>
              ↩ {t("docs.newDoc")}
            </button>
          </div>

          {/* Mock mode warning */}
          {ocrData.mode === "mock" && (
            <div style={{ padding: "10px 14px", background: "#FEF3C7", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#92400E" }}>
              ⚠ Backend offline — demo mode. Backend chala kar real OCR use karein.
            </div>
          )}

          {/* Document Score Card — AI-powered (new backend) or keyword fallback */}
          {ocrData.doc_score ? (
            <DocumentScoreCard docScore={ocrData.doc_score} />
          ) : ocrData.accuracy && (
            <div className="lg-accuracy-card" style={{ marginBottom: 20 }}>
              <div className="lg-accuracy-left">
                <div className="lg-accuracy-label">{t("docs.strength")}</div>
                <div className="lg-accuracy-pct">{ocrData.accuracy.win_pct}<span>%</span></div>
                <div className={`lg-accuracy-badge lg-accuracy-badge--${ocrData.accuracy.confidence?.toLowerCase()}`}>
                  {ocrData.accuracy.confidence}
                </div>
              </div>
              <div className="lg-accuracy-right">
                <div className="lg-accuracy-bar-wrap">
                  <div className="lg-accuracy-bar" style={{ width: ocrData.accuracy.win_pct + "%" }} />
                </div>
                <div className="lg-accuracy-note">{ocrData.accuracy.note}</div>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {aiAnalysis && (
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
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0E7A45", textTransform: "uppercase", letterSpacing: "0.04em" }}>LawyerGPT — Document Review</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: "#1F2937" }}>
                {renderMd(aiAnalysis)}
              </div>
            </div>
          )}

          {/* Inline chat */}
          <InlineChat
            contextHistory={chatContext}
            replyLang={replyLang}
            lang={lang}
          />
        </div>
      )}
    </div>
  );
};

export default DocsTab;
