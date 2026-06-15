import { useState, useRef } from "react";
import { api } from "../utils/api";
import { renderMd } from "../utils/renderMd.jsx";
import InlineChat from "./InlineChat";
import Icon from "./Icon";
import { useT } from "../utils/i18n.jsx";

const detectLang = (text) => {
  if (/[؀-ۿ]/.test(text)) return "ur";
  const words = text.toLowerCase().split(/\s+/);
  const romanUrdu = ["mera","meri","kya","hai","aap","ka","ki","ke","ko","mein","nahi","kar","masla","case","nikah"];
  return words.filter(w => romanUrdu.includes(w)).length >= 2 ? "roman-ur" : "en";
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
    const detectedLang = detectLang(extractedText) || lang || "en";
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

          {/* Accuracy card */}
          {ocrData.accuracy && (
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
              background: "#fff", border: "1.5px solid #E8F5EE", borderRadius: 14,
              marginBottom: 4, overflow: "hidden",
              boxShadow: "0 2px 12px rgba(14,122,69,0.08)"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #0E7A45 0%, #065F38 100%)",
                padding: "12px 18px", display: "flex", alignItems: "center", gap: 10
              }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>LawyerGPT — Document Analysis</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>AI se legal review</div>
                </div>
              </div>
              <div style={{ padding: "18px 20px", fontSize: 14, lineHeight: 1.7, color: "#1F2937" }}>
                {renderMd(aiAnalysis)}
              </div>
            </div>
          )}

          {/* Extracted text (collapsible) */}
          {ocrData.extracted_text && (
            <details style={{ marginTop: 12, marginBottom: 4 }}>
              <summary style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", cursor: "pointer", padding: "8px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Extracted Raw Text ({ocrData.char_count} chars)
              </summary>
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px", marginTop: 8, fontSize: 12.5, color: "#374151", lineHeight: 1.6, maxHeight: 200, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                {ocrData.extracted_text.slice(0, 1200)}{ocrData.extracted_text.length > 1200 ? "…" : ""}
              </div>
            </details>
          )}

          {/* Inline chat */}
          <InlineChat
            contextHistory={chatContext}
            replyLang={replyLang}
            placeholder="Is document ke baare mein kuch aur poochein..."
            headerLabel="Document ke baare mein aur sawaal poochein"
          />
        </div>
      )}
    </div>
  );
};

export default DocsTab;
