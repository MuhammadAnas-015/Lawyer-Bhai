import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";
import { renderMd } from "../utils/renderMd.jsx";

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "4px 2px", alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "#9CA3AF", display: "inline-block",
        animation: `ftyping 1.2s ${i * 0.2}s infinite ease-in-out`
      }} />
    ))}
  </div>
);

const AiAvatar = () => (
  <div style={{
    width: 28, height: 28, borderRadius: "50%", background: "#E8F5EE",
    border: "1.5px solid #BBE9CE", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0, marginTop: 2
  }}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  </div>
);

const InlineChat = ({ contextHistory = [], replyLang = "en", placeholder, lang = "en" }) => {
  const defaultPlaceholder = lang === "ur"
    ? "مزید سوال پوچھیں..."
    : lang === "roman-ur"
    ? "Aur kuch poochein..."
    : "Ask a follow-up question…";
  placeholder = placeholder || defaultPlaceholder;
  const [msgs, setMsgs]     = useState([]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const endRef    = useRef(null);
  const lastAiRef = useRef(null);

  useEffect(() => {
    const last = msgs[msgs.length - 1];
    if (last?.role === "ai" && lastAiRef.current) {
      setTimeout(() => lastAiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [msgs, typing]);

  const send = async () => {
    const txt = input.trim();
    if (!txt || typing) return;
    setMsgs(m => [...m, { role: "user", text: txt }]);
    setInput("");
    setTyping(true);
    try {
      const history = [
        ...contextHistory,
        ...msgs.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
      ];
      const data = await api.chat(txt, history, replyLang);
      setTyping(false);
      setMsgs(m => [...m, { role: "ai", text: data.reply }]);
    } catch {
      setTyping(false);
      setMsgs(m => [...m, { role: "ai", text: replyLang === "ur"
        ? "کنیکشن میں مسئلہ آیا، دوبارہ کوشش کریں۔"
        : replyLang === "roman-ur"
        ? "Connection mein masla aya, dobara try karein."
        : "Connection issue. Please try again." }]);
    }
  };

  const dividerLabel = lang === "ur"
    ? "مزید سوال پوچھیں"
    : lang === "roman-ur"
    ? "Aur sawaal poochein"
    : "Ask follow-up questions";

  return (
    <div style={{ marginTop: 28 }}>
      {/* Simple divider */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ borderTop: "1.5px dashed #D1D5DB" }} />
        <span style={{
          position: "absolute", top: -10, left: 0,
          background: "#F9FAFB", paddingRight: 10,
          fontSize: 11, color: "#9CA3AF", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.07em"
        }}>{dividerLabel}</span>
      </div>

      {/* Messages — only shown after first message */}
      {(msgs.length > 0 || typing) && (
        <div style={{
          padding: "14px 14px", display: "flex", flexDirection: "column", gap: 10,
          maxHeight: 340, overflowY: "auto", background: "#F8FAFB",
          scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent"
        }}>
          {msgs.map((m, i) => {
            const isAI = m.role === "ai";
            const isLastAI = isAI && i === msgs.length - 1;
            return (
              <div key={i} ref={isLastAI ? lastAiRef : null}
                style={{ display: "flex", gap: 8, flexDirection: isAI ? "row" : "row-reverse", alignItems: "flex-start" }}>
                {isAI && <AiAvatar />}
                <div style={{
                  background: isAI ? "#fff" : "#0E7A45",
                  color: isAI ? "#1F2937" : "#fff",
                  padding: "10px 14px",
                  borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                  fontSize: 13.5, lineHeight: 1.65,
                  boxShadow: isAI ? "0 1px 4px rgba(0,0,0,0.07)" : "0 2px 8px rgba(14,122,69,0.25)",
                  border: isAI ? "1px solid #EEF0F2" : "none",
                  maxWidth: "85%", wordBreak: "break-word"
                }}>
                  {isAI ? renderMd(m.text) : m.text}
                </div>
              </div>
            );
          })}
          {typing && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AiAvatar />
              <div style={{ background: "#fff", border: "1px solid #EEF0F2", padding: "10px 14px", borderRadius: "4px 14px 14px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: msgs.length > 0 || typing ? 10 : 0 }}>
        <textarea
          rows={1}
          placeholder={placeholder}
          value={input}
          disabled={typing}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px";
          }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{
            flex: 1, resize: "none", border: "1.5px solid #E5E7EB", borderRadius: 10,
            padding: "8px 12px", fontSize: 13.5, fontFamily: "inherit", outline: "none",
            lineHeight: 1.5, minHeight: 38, maxHeight: 90,
            background: typing ? "#F9FAFB" : "#fff", color: "#1F2937",
            scrollbarWidth: "none", transition: "border-color 150ms"
          }}
          onFocus={e => { e.target.style.borderColor = "#0E7A45"; }}
          onBlur={e => { e.target.style.borderColor = "#E5E7EB"; }}
        />
        <button onClick={send} disabled={!input.trim() || typing} style={{
          width: 38, height: 38, borderRadius: 10, border: "none", flexShrink: 0,
          background: input.trim() && !typing ? "#0E7A45" : "#D1D5DB",
          cursor: input.trim() && !typing ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 150ms"
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InlineChat;
