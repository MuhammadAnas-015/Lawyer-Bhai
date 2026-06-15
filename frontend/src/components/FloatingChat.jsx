import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";
import { useT } from "../utils/i18n.jsx";

const detectLang = (text) => {
  if (/[؀-ۿ]/.test(text)) return "ur";
  const t = text.toLowerCase();
  const romanUrdu = ["mera","meri","mujhe","kya","hai","kaise","karna","nahi","aap","ka","ki","ke","ko","mein","hain","wala","kar","raha","rahi","gaya","kiya","masla","kiraya","talaq","naukri","zameen","chori","dhoka","makan","shadi","bachay","case","nikah","sawaal","poochna","batao","chahiye","hota","hoti","mere","teri","tere","hamara","apna","sath","phir","lekin","agar","to","bhi","sirf","hum","tum","woh","yeh","koi","sab","ky","hy","hn","krna","kro","kren"];
  const words = t.split(/\s+/);
  const hits = words.filter((w) => romanUrdu.includes(w)).length;
  return hits >= 2 ? "roman-ur" : "en";
};

const FALLBACKS = {
  en: [
    "Based on Pakistani law, I recommend consulting a lawyer for your specific situation. The Contract Act 1872 and Constitution of Pakistan 1973 protect your fundamental rights.",
    "This appears to be a legal matter. Under Pakistani law, you have the right to fair trial (Article 10-A). Please consult a qualified lawyer.",
  ],
  "roman-ur": [
    "Pakistani qanoon ke mutabiq, aapke masle ke liye vakeel se mashwara karna zaroori hai. Aapke bunyadi huqooq Constitution ke Article 9 aur 10-A se protected hain.",
    "Ye qanooni masla lagta hai. NIRC ya Civil Court mein case file kar sakte hain. Pehle tamam documents tayyar karein.",
  ],
  ur: [
    "پاکستانی قانون کے مطابق، آپ کے مسئلے کے لیے وکیل سے مشورہ ضروری ہے۔ آپ کے بنیادی حقوق آئین کے آرٹیکل 9 اور 10-A سے محفوظ ہیں۔",
    "یہ قانونی معاملہ لگتا ہے۔ NIRC یا سول کورٹ میں کیس دائر کر سکتے ہیں۔",
  ],
};

const ProviderBadge = ({ provider }) => {
  if (!provider || provider === "rule-based") return null;
  const colors = { gemini: { bg: "#E8F0FE", text: "#1A73E8" }, groq: { bg: "#F3E8FF", text: "#7C3AED" } };
  const c = colors[provider] || { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: c.bg, color: c.text, marginLeft: 6, verticalAlign: "middle", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {provider === "gemini" ? "✦ Gemini" : "⚡ Groq"}
    </span>
  );
};

const FloatingChat = ({ lang = "en" }) => {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "ai", text: t("chat.greeting"), provider: null }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);
  useEffect(() => {
    setMsgs((m) => m.length === 1 && m[0].role === "ai" ? [{ role: "ai", text: t("chat.greeting"), provider: null }] : m);
  }, [lang]);

  const send = async () => {
    const txt = input.trim();
    if (!txt) return;
    const replyLang = detectLang(txt);
    setMsgs((m) => [...m, { role: "user", text: txt }]);
    setInput("");
    setTyping(true);
    try {
      const history = msgs.slice(-8).map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
      const data = await api.chat(txt, history, replyLang);
      setTyping(false);
      setMsgs((m) => [...m, { role: "ai", text: data.reply, provider: data.ai_provider }]);
    } catch {
      setTyping(false);
      const pool = FALLBACKS[replyLang] || FALLBACKS.en;
      setMsgs((m) => [...m, { role: "ai", text: pool[Math.floor(Math.random() * pool.length)], provider: null }]);
    }
  };

  const quickQuestions = [
    { label: "🏠 Kiraya masla", msg: "Mera makan maalik bina notice ke nikal raha hai kya karna chahiye?" },
    { label: "👔 Naukri se nikala", msg: "Employer ne bina notice ke job se nikal diya, kya rights hain?" },
    { label: "👨‍👩‍👧 Talaq/Custody", msg: "Talaq ke baad bachon ki custody kaise milti hai?" },
    { label: "🔒 Online fraud", msg: "Kisi ne online paise fraud kar ke le gaya, kya karna chahiye?" },
  ];

  return (
    <>
      {open && (
        <div className="fchat-window">
          <div className="fchat-head">
            <div className="fchat-head-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="fchat-head-info">
              <div className="fchat-head-name">{t("chat.name")} <span style={{ fontSize: 10, background: "#D1FAE5", color: "#065F46", padding: "1px 7px", borderRadius: 20, fontWeight: 700, marginLeft: 4 }}>AI Powered</span></div>
              <div className="fchat-head-status">{t("chat.status")}</div>
            </div>
            <button className="fchat-close" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="fchat-msgs">
            {msgs.map((m, i) => (
              <div key={i} className={`fchat-msg fchat-msg--${m.role}`}>
                {m.role === "ai" && (
                  <div className="fchat-msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                )}
                <div>
                  <div className="fchat-msg-bubble" style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                  {m.role === "ai" && m.provider && <ProviderBadge provider={m.provider} />}
                </div>
              </div>
            ))}
            {typing && (
              <div className="fchat-msg fchat-msg--ai">
                <div className="fchat-msg-avatar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div className="fchat-msg-bubble fchat-typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length <= 1 && (
            <div style={{ padding: "8px 12px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid #F3F4F6" }}>
              {quickQuestions.map((q, i) => (
                <button key={i} onClick={() => { setInput(q.msg); }}
                  style={{ fontSize: 11, padding: "5px 10px", borderRadius: 20, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", cursor: "pointer", fontWeight: 600 }}>
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <div className="fchat-input-row">
            <input className="fchat-input" placeholder={t("chat.placeholder")} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()} />
            <button className="fchat-send" onClick={send} disabled={!input.trim() || typing}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
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
