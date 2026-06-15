import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";
import { useT } from "../utils/i18n.jsx";

const detectLang = (text) => {
  if (/[؀-ۿ]/.test(text)) return "ur";
  const t = text.toLowerCase();
  const romanUrdu = ["mera","meri","mujhe","kya","hai","kaise","karna","nahi","aap","ka","ki","ke","ko","mein","hain","wala","kar","raha","rahi","gaya","kiya","masla","kiraya","talaq","naukri","zameen","chori","dhoka","makan","shadi","bachay","case","nikah","sawaal","batao","chahiye","hota","hoti","mere","teri","tere","hamara","apna","lekin","agar","bhi","sirf","hum","tum","woh","yeh","koi","sab","ky","hy","hn","krna","kro","kren","bhai","yar","yr","poochna","haan","theek","acha","shukriya","karo","dena","lena","jana","aana","krein","krain","krdo","hoga","hogi","tha","thi","the","hun","hoon","ap","he"];
  const words = t.split(/\s+/);
  const hits = words.filter((w) => romanUrdu.includes(w)).length;
  return hits >= 2 ? "roman-ur" : "en";
};

// Markdown renderer: **bold**, *italic*, bullet lists, line breaks
const renderMd = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      elements.push(<br key={key++} />);
      continue;
    }
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      elements.push(
        <div key={key++} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}>
          <span style={{ color: "#0E7A45", fontWeight: 700, flexShrink: 0 }}>•</span>
          <span>{inlineFormat(bulletMatch[1])}</span>
        </div>
      );
      continue;
    }
    elements.push(<div key={key++} style={{ marginBottom: "1px" }}>{inlineFormat(line)}</div>);
  }
  return elements;
};

const inlineFormat = (text) => {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match;
  let k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    const raw = match[0];
    if (raw.startsWith("**")) parts.push(<strong key={k++}>{raw.slice(2, -2)}</strong>);
    else parts.push(<em key={k++}>{raw.slice(1, -1)}</em>);
    last = match.index + raw.length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length === 0 ? text : parts;
};

const FALLBACKS = {
  en: [
    "I'm having a connection issue right now, but your legal matter sounds important. Please try again in a moment — I want to give you proper guidance.",
    "Temporarily offline. Please try again shortly.",
  ],
  "roman-ur": [
    "Abhi connection mein masla aa raha hai. Thodi der baad dobara try karein — aapka masla mujhe zaroor sunna hai.",
    "Kuch technical masla hai. Please thodi der mein dobara poochein.",
  ],
  ur: [
    "ابھی کنیکشن میں مسئلہ آ رہا ہے۔ تھوڑی دیر بعد دوبارہ کوشش کریں — آپ کا مسئلہ مجھے ضرور سننا ہے۔",
    "کچھ تکنیکی مسئلہ ہے۔ براہ کرم تھوڑی دیر میں دوبارہ پوچھیں۔",
  ],
};

const ProviderBadge = ({ provider }) => {
  if (!provider || provider === "rule-based") return null;
  const isGemini = provider === "gemini";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 8,
      background: isGemini ? "#E8F0FE" : "#F3E8FF",
      color: isGemini ? "#1A73E8" : "#7C3AED",
      marginTop: 4, display: "inline-block",
      letterSpacing: "0.05em", textTransform: "uppercase"
    }}>
      {isGemini ? "✦ Gemini AI" : "⚡ Groq AI"}
    </span>
  );
};

const QUICK = [
  { label: "🏠 Kiraya masla", msg: "Mera makan maalik bina notice ke nikal raha hai, kya karna chahiye?" },
  { label: "💼 Job se nikala", msg: "Employer ne bina notice ke naukri se nikal diya, mere kya rights hain?" },
  { label: "👨‍👩‍👧 Custody", msg: "Talaq ke baad bachon ki custody kaise milti hai Pakistan mein?" },
  { label: "💸 Online fraud", msg: "Kisi ne mujhe online fraud kar ke paise le gaya, kya karna chahiye?" },
  { label: "🏛️ FIR kaise", msg: "FIR kaise darj karate hain aur police refuse kare to kya karein?" },
  { label: "📋 Contract", msg: "Dusre party ne hamare contract ki khilaaf warzi ki, kya options hain?" },
];

const FloatingChat = ({ lang = "en" }) => {
  const { t } = useT();
  const [open, setOpen]   = useState(false);
  const [msgs, setMsgs]   = useState([{ role: "ai", text: "Assalam o Alaikum! Main Lawyer Bhai hoon — aapka AI legal assistant. Apna masla poochein, main Pakistani qanoon ke mutabiq guide karunga! 🤝", provider: null }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const send = async () => {
    const txt = input.trim();
    if (!txt || typing) return;
    const replyLang = detectLang(txt);
    setMsgs((m) => [...m, { role: "user", text: txt }]);
    setInput("");
    setTyping(true);
    try {
      const history = msgs.slice(-10).map((m) => ({
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

  const pickQuick = (msg) => {
    setInput(msg);
    setTimeout(() => document.getElementById("fchat-inp")?.focus(), 50);
  };

  return (
    <>
      {open && (
        <div className="fchat-window" style={{ display: "flex", flexDirection: "column", height: 520 }}>

          {/* Header */}
          <div className="fchat-head" style={{ flexShrink: 0 }}>
            <div className="fchat-head-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="fchat-head-info">
              <div className="fchat-head-name">
                Lawyer Bhai AI
                <span style={{ fontSize: 9, background: "#D1FAE5", color: "#065F46", padding: "2px 7px", borderRadius: 20, fontWeight: 700, marginLeft: 6 }}>AI Powered</span>
              </div>
              <div className="fchat-head-status">
                <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#22C55E", marginRight: 5 }}/>
                Online — Pakistani Law Expert
              </div>
            </div>
            <button className="fchat-close" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="fchat-msgs" style={{ flex: 1, overflowY: "auto" }}>
            {msgs.map((m, i) => (
              <div key={i} className={`fchat-msg fchat-msg--${m.role}`}>
                {m.role === "ai" && (
                  <div className="fchat-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: m.role === "ai" ? "flex-start" : "flex-end" }}>
                  <div className="fchat-msg-bubble" style={{ lineHeight: 1.6 }}>
                    {m.role === "ai" ? renderMd(m.text) : m.text}
                  </div>
                  {m.role === "ai" && <ProviderBadge provider={m.provider} />}
                </div>
              </div>
            ))}
            {typing && (
              <div className="fchat-msg fchat-msg--ai">
                <div className="fchat-msg-avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div className="fchat-msg-bubble fchat-typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions — show only at start */}
          {msgs.length <= 1 && (
            <div style={{ padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 5, borderTop: "1px solid #F3F4F6", flexShrink: 0, background: "#FAFAFA" }}>
              {QUICK.map((q, i) => (
                <button key={i} onClick={() => pickQuick(q.msg)} style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 20,
                  border: "1px solid #E5E7EB", background: "#fff",
                  color: "#374151", cursor: "pointer", fontWeight: 600,
                  transition: "all 150ms"
                }}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="fchat-input-row" style={{ flexShrink: 0 }}>
            <input
              id="fchat-inp"
              className="fchat-input"
              placeholder="Apna legal masla poochein..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              disabled={typing}
            />
            <button className="fchat-send" onClick={send} disabled={!input.trim() || typing}
              style={{ opacity: (!input.trim() || typing) ? 0.5 : 1 }}>
              {typing
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              }
            </button>
          </div>

        </div>
      )}

      {/* Trigger button */}
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
