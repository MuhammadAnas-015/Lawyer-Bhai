import { useState, useRef, useEffect } from "react";
import { api } from "../utils/api";
import { useT } from "../utils/i18n.jsx";

// Detect if a message is English or Roman-Urdu/Urdu
const detectLang = (text) => {
  // Urdu script → ur
  if (/[؀-ۿ]/.test(text)) return "ur";
  const t = text.toLowerCase();
  // Common Roman-Urdu markers
  const romanUrdu = ["mera","meri","mujhe","kya","hai","kaise","karna","nahi","aap","ka","ki","ke","ko","mein","hain","wala","kar","raha","rahi","gaya","kiya","masla","kiraya","talaq","naukri","zameen","chori","dhoka","makan","shadi","bachay","case","nikah","sawaal","poochna","batao","chahiye","hota","hoti"];
  const words = t.split(/\s+/);
  const hits = words.filter((w) => romanUrdu.includes(w)).length;
  // If 2+ roman-urdu words, treat as roman-urdu
  return hits >= 2 ? "roman-ur" : "en";
};

const FALLBACKS = {
  en: [
    "I understood your problem. The Contract Act 1872 applies to this case in Pakistan.",
    "This is a criminal matter — PPC Section 420 applies. File an FIR.",
    "In family law, you can file a petition in court under MFLO 1961 Section 7.",
  ],
  "roman-ur": [
    "Aapka masla samajh aa gaya. Pakistan mein is case ke liye Contract Act 1872 laagu hoti hai.",
    "Ye criminal matter hai — PPC Section 420 apply hoti hai. FIR darj karaein.",
    "Family law case mein MFLO 1961 ke Section 7 ke tehat court mein petition dakhil karein.",
  ],
  ur: [
    "آپ کا مسئلہ سمجھ آ گیا۔ پاکستان میں اس کیس کے لیے کنٹریکٹ ایکٹ 1872 لاگو ہوتا ہے۔",
    "یہ فوجداری معاملہ ہے — PPC دفعہ 420 لاگو ہوتی ہے۔ FIR درج کرائیں۔",
    "خاندانی قانون میں MFLO 1961 کی دفعہ 7 کے تحت عدالت میں درخواست دائر کریں۔",
  ],
};

const FloatingChat = ({ lang = "en" }) => {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "ai", text: t("chat.greeting") }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  // Update greeting when language changes (only if still the initial single message)
  useEffect(() => {
    setMsgs((m) => (m.length === 1 && m[0].role === "ai") ? [{ role: "ai", text: t("chat.greeting") }] : m);
  }, [lang]);

  const send = async () => {
    const txt = input.trim();
    if (!txt) return;
    const replyLang = detectLang(txt); // en | roman-ur | ur
    setMsgs((m) => [...m, { role: "user", text: txt }]);
    setInput("");
    setTyping(true);
    try {
      const data = await api.chat(txt, msgs.slice(-6).map((m) => ({ role: m.role, content: m.text })), replyLang);
      setTyping(false);
      setMsgs((m) => [...m, { role: "ai", text: data.reply }]);
    } catch {
      setTyping(false);
      const pool = FALLBACKS[replyLang] || FALLBACKS.en;
      setMsgs((m) => [...m, { role: "ai", text: pool[Math.floor(Math.random() * pool.length)] }]);
    }
  };

  return (
    <>
      {open && (
        <div className="fchat-window">
          <div className="fchat-head">
            <div className="fchat-head-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="fchat-head-info">
              <div className="fchat-head-name">{t("chat.name")}</div>
              <div className="fchat-head-status">{t("chat.status")}</div>
            </div>
            <button className="fchat-close" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="fchat-msgs">
            {msgs.map((m, i) => (
              <div key={i} className={`fchat-msg fchat-msg--${m.role}`}>
                {m.role === "ai" && <div className="fchat-msg-avatar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E7A45" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>}
                <div className="fchat-msg-bubble">{m.text}</div>
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
          <div className="fchat-input-row">
            <input className="fchat-input" placeholder={t("chat.placeholder")} value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="fchat-send" onClick={send} disabled={!input.trim()}>
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
          {!open && <span className="fchat-badge">1</span>}
        </button>
      </div>
    </>
  );
};

export default FloatingChat;
