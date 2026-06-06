import { useState, useRef } from "react";
import { api } from "../utils/api";
import Icon from "./Icon";
import { useT } from "../utils/i18n.jsx";

const DocsTab = ({ lang }) => {
  const { t } = useT();
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setStatus("uploading"); setResult(null);
    try {
      const data = await api.ocr(file);
      setResult({ mode: "api", file: file.name, ...data });
    } catch {
      setResult({ mode: "mock", file: file.name });
    }
    setStatus("done");
  };

  return (
    <div className="docs-wrap">
      <h1>{t("docs.title")}</h1>
      {status === "idle" && (
        <div className={`upload-zone${dragOver ? " upload-zone--drag" : ""}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.bmp,.tiff,.webp" style={{ display: "none" }} onChange={(e) => processFile(e.target.files[0])} />
          <div className="upload-icon"><Icon name="upload-cloud" size={26} color="#0E7A45" /></div>
          <h3>{t("docs.upload")}</h3>
          <p>{t("docs.uploadDesc")}</p>
          <button className="lb-btn lb-btn--primary" style={{ marginTop: 18 }} onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
            {t("docs.selectFile")}
          </button>
        </div>
      )}

      {status === "uploading" && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="char-3d-spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "#6B7280" }}>{t("docs.processing")}</p>
        </div>
      )}

      {status === "done" && result && (
        <div className="docs-results">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>Analysis — {result.file}</h2>
            <button className="lb-btn" style={{ marginLeft: "auto", fontSize: 13, padding: "6px 14px" }}
              onClick={() => { setStatus("idle"); setResult(null); }}>↩ {t("docs.newDoc")}</button>
          </div>
          {result.mode === "mock" && (
            <div style={{ padding: "10px 14px", background: "#FEF3C7", borderRadius: 8, marginBottom: 16, fontSize: 13, color: "#92400E" }}>
              ⚠ Backend offline — demo mode. Backend chala kar real OCR use karein.
            </div>
          )}
          {result.extracted_text && (
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t("docs.extracted")}</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, maxHeight: 160, overflowY: "auto", whiteSpace: "pre-wrap" }}>
                {result.extracted_text.slice(0, 800)}{result.extracted_text.length > 800 ? "…" : ""}
              </div>
            </div>
          )}
          {result.accuracy && (
            <div className="lg-accuracy-card" style={{ marginBottom: 20 }}>
              <div className="lg-accuracy-left">
                <div className="lg-accuracy-label">{t("docs.strength")}</div>
                <div className="lg-accuracy-pct">{result.accuracy.win_pct}<span>%</span></div>
                <div className={`lg-accuracy-badge lg-accuracy-badge--${result.accuracy.confidence?.toLowerCase()}`}>{result.accuracy.confidence}</div>
              </div>
              <div className="lg-accuracy-right">
                <div className="lg-accuracy-bar-wrap"><div className="lg-accuracy-bar" style={{ width: result.accuracy.win_pct + "%" }} /></div>
                <div className="lg-accuracy-note">{result.accuracy.note}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocsTab;
