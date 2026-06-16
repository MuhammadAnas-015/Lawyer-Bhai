import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";
import { useT } from "../utils/i18n.jsx";
import { renderMd } from "../utils/renderMd.jsx";

const detectLang = (text) => {
  if (/[؀-ۿ]/.test(text)) return "ur";
  const t = text.toLowerCase();
  // Only unambiguous Roman Urdu words — removed English false-positives like "the", "he", "ka", "ki", "ke"
  const romanUrdu = [
    "mera","meri","mujhe","kya","kaise","karna","nahi","aap","wala",
    "raha","rahi","gaya","kiya","masla","kiraya","talaq","naukri",
    "zameen","chori","dhoka","makan","shadi","bachay","nikah","sawaal",
    "batao","chahiye","hota","hoti","mere","teri","tere","hamara","apna",
    "lekin","agar","bhi","sirf","hum","tum","woh","yeh","koi","sab",
    "krna","kro","kren","bhai","poochna","haan","theek","acha","shukriya",
    "krein","krain","krdo","hoga","hogi","hun","hoon","mein","hain","hai",
    "krha","krhe","nahin","hona","lagta","lagti","chahta","chahti"
  ];
  const words = t.split(/\s+/);
  const hits = words.filter(w => romanUrdu.includes(w)).length;
  return hits >= 3 ? "roman-ur" : "en";
};


const FALLBACKS = {
  en: ["I'm having a connection issue right now. Please try again in a moment — your legal matter is important."],
  "roman-ur": ["Abhi connection mein masla aa raha hai. Thodi der baad dobara try karein — aapka masla zaroor sunna chahta hun."],
  ur: ["ابھی کنیکشن میں مسئلہ آ رہا ہے۔ تھوڑی دیر بعد دوبارہ کوشش کریں۔"],
};

const ProviderBadge = () => null;

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "4px 2px", alignItems: "center" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "#9CA3AF",
        display: "inline-block",
        animation: `ftyping 1.2s ${i * 0.2}s infinite ease-in-out`
      }} />
    ))}
  </div>
);

const GREETINGS = {
  ur: "السلام علیکم! 👋 میں LawyerGPT ہوں — آپ کا ذاتی AI وکیل۔\n\nکوئی بھی قانونی سوال پوچھیں — FIR، جائیداد، خاندان، ملازمت، فراڈ — پاکستانی قانون کے مطابق سیدھا جواب دوں گا۔",
  en: "Assalam-o-Alaikum! 👋 I'm LawyerGPT — your personal AI lawyer.\n\nAsk me anything about Pakistani law — FIR, property, family, employment, fraud, or any legal matter. I give direct answers, no referrals.",
  "roman-ur": "Assalam o Alaikum! 👋 Main LawyerGPT hoon — aapka personal AI lawyer.\n\nApna koi bhi legal masla poochein — FIR, talaq, property, job, fraud, ya kuch bhi. Main Pakistani qanoon ke mutabiq seedha jawab dunga.",
};

const FloatingChat = ({ lang = "en" }) => {
  const { t } = useT();
  const [open, setOpen]     = useState(false);
  const [msgs, setMsgs]     = useState(() => [{
    role: "ai",
    text: GREETINGS[lang] || GREETINGS["roman-ur"],
    provider: null
  }]);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const msgsEndRef  = useRef(null);
  const lastAiRef   = useRef(null);
  const msgsBoxRef  = useRef(null);

  // When user sends or typing indicator: scroll to bottom
  // When AI reply arrives: scroll to TOP of new message so user reads from start
  useEffect(() => {
    const lastMsg = msgs[msgs.length - 1];
    if (lastMsg?.role === "ai" && msgs.length > 1 && lastAiRef.current) {
      setTimeout(() => lastAiRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      setTimeout(() => msgsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [msgs]);

  useEffect(() => {
    if (typing) setTimeout(() => msgsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [typing]);

  const send = async () => {
    const txt = input.trim();
    if (!txt || typing) return;
    const replyLang = detectLang(txt);
    setMsgs((m) => [...m, { role: "user", text: txt }]);
    setInput("");
    setTyping(true);
    try {
      const history = msgs.slice(-12).map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));
      const data = await api.chat(txt, history, replyLang);
      setTyping(false);
      setMsgs((m) => [...m, { role: "ai", text: data.reply, provider: data.ai_provider }]);
    } catch {
      setTyping(false);
      const pool = FALLBACKS[replyLang] || FALLBACKS.en;
      setMsgs((m) => [...m, { role: "ai", text: pool[0], provider: null }]);
    }
  };

  return (
    <>
      {open && (
        <div className="fchat-window" style={{ display: "flex", flexDirection: "column", height: 600, width: 480 }}>

          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(135deg, #0E7A45 0%, #065F38 100%)",
            padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
            borderRadius: "20px 20px 0 0"
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>LawyerGPT</span>
                <span style={{ fontSize: 9, background: "#D1FAE5", color: "#065F46", padding: "2px 8px", borderRadius: 20, fontWeight: 800, letterSpacing: "0.04em" }}>POWERED BY AI</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                {t("chat.status")}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.9)", borderRadius: 8, padding: 6,
              display: "flex", transition: "background 150ms"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* ── Messages ── */}
          <div ref={msgsBoxRef} style={{
            flex: 1, overflowY: "auto", padding: "16px 14px",
            display: "flex", flexDirection: "column", gap: 12,
            background: "#F8FAFB",
            scrollbarWidth: "thin", scrollbarColor: "#D1D5DB transparent"
          }}>
            {msgs.map((m, i) => {
              const isAI = m.role === "ai";
              const isLastAI = isAI && i === msgs.length - 1;
              return (
                <div
                  key={i}
                  ref={isLastAI ? lastAiRef : null}
                  style={{
                    display: "flex", gap: 9,
                    flexDirection: isAI ? "row" : "row-reverse",
                    alignItems: "flex-start"
                  }}
                >
                  {isAI && (
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: "#E8F5EE", border: "1.5px solid #BBE9CE",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 2
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end", maxWidth: "82%" }}>
                    <div style={{
                      background: isAI ? "#fff" : "#0E7A45",
                      color: isAI ? "#1F2937" : "#fff",
                      padding: "11px 14px",
                      borderRadius: isAI ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                      fontSize: 13.5, lineHeight: 1.65,
                      boxShadow: isAI ? "0 1px 4px rgba(0,0,0,0.07)" : "0 2px 8px rgba(14,122,69,0.3)",
                      border: isAI ? "1px solid #EEF0F2" : "none",
                      maxWidth: "100%", wordBreak: "break-word"
                    }}>
                      {isAI ? renderMd(m.text) : m.text}
                    </div>
                    {isAI && <ProviderBadge provider={m.provider} />}
                  </div>
                </div>
              );
            })}

            {typing && (
              <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "#E8F5EE", border: "1.5px solid #BBE9CE",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div style={{
                  background: "#fff", border: "1px solid #EEF0F2",
                  padding: "11px 16px", borderRadius: "4px 16px 16px 16px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* ── Input ── */}
          <div style={{
            padding: "12px 14px", background: "#fff",
            borderTop: "1px solid #EEF0F2", flexShrink: 0,
            borderRadius: "0 0 20px 20px"
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                id="fchat-inp"
                rows={1}
                placeholder={t("chat.placeholder")}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                disabled={typing}
                style={{
                  flex: 1, resize: "none", border: "1.5px solid #E5E7EB",
                  borderRadius: 12, padding: "10px 14px", fontSize: 13.5,
                  fontFamily: "inherit", outline: "none", lineHeight: 1.5,
                  background: typing ? "#F9FAFB" : "#fff", color: "#1F2937",
                  transition: "border-color 150ms", minHeight: 40, maxHeight: 100,
                  scrollbarWidth: "none"
                }}
                onFocus={(e) => { e.target.style.borderColor = "#0E7A45"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || typing}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: "none",
                  background: input.trim() && !typing ? "#0E7A45" : "#D1D5DB",
                  cursor: input.trim() && !typing ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms", flexShrink: 0
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 6, textAlign: "center" }}>
              LawyerGPT — Pakistani law expert · Shift+Enter for new line
            </div>
          </div>

        </div>
      )}

      {/* ── Trigger button ── */}
      <div className="fchat-trigger" onClick={() => setOpen((o) => !o)}>
        {!open && <span className="fchat-label">LawyerGPT</span>}
        <button className="fchat-btn" title="Lawyer Bhai AI se poochein">
          {open
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          }
          {!open && <span className="fchat-badge">AI</span>}
        </button>
      </div>
    </>
  );
};

export default FloatingChat;
