import { useState, useRef, useEffect } from "react";
import Icon from "./Icon";

const TopBar = ({ lang, setLang, onSignOut, onProfile, user = {} }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const firstName = user.name ? user.name.split(" ")[0] : "Aap";

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="topbar">
      <a className="logo" href="#">
        <svg viewBox="0 0 72 80" width="28" height="32">
          <g fill="#0E7A45">
            <rect x="34" y="14" width="4" height="48" rx="1"/>
            <rect x="24" y="60" width="24" height="5" rx="1.5"/>
            <rect x="20" y="64" width="32" height="3" rx="1.5"/>
            <circle cx="36" cy="14" r="3"/>
            <rect x="12" y="22" width="48" height="3" rx="1.5"/>
            <path d="M16 25 L10 38" stroke="#0E7A45" strokeWidth="1.5" fill="none"/>
            <path d="M16 25 L22 38" stroke="#0E7A45" strokeWidth="1.5" fill="none"/>
            <path d="M56 25 L50 38" stroke="#0E7A45" strokeWidth="1.5" fill="none"/>
            <path d="M56 25 L62 38" stroke="#0E7A45" strokeWidth="1.5" fill="none"/>
            <path d="M7 38 L25 38 L22 44 L10 44 Z"/>
            <path d="M47 38 L65 38 L62 44 L50 44 Z"/>
          </g>
        </svg>
        <span className="logo-text">Lawyer Bhai AI</span>
      </a>

      <div className="top-right">
        <div className="lang-switch">
          <button className={`lang-opt${lang === "en" ? " is-active" : ""}`} onClick={() => setLang("en")}>English</button>
          <span className="lang-sep">|</span>
          <button className={`lang-opt lang-urdu${lang === "ur" ? " is-active" : ""}`} onClick={() => setLang("ur")}>اردو</button>
        </div>

        <div className="user-menu-wrap" ref={ref}>
          <div className="user-menu" onClick={() => setOpen((o) => !o)}>
            <div className="avatar"><Icon name="user" size={16} color="#6B7280" strokeWidth={2} /></div>
            <span className="user-name">{firstName}</span>
            <Icon name="chevron-down" size={14} color="#374151" strokeWidth={2} />
          </div>

          {open && (
            <div className="user-dropdown">
              <div className="user-dropdown-head">
                <div className="user-dropdown-avatar">
                  <Icon name="user" size={20} color="#0E7A45" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="user-dropdown-name">{user.name || "User"}</div>
                  <div className="user-dropdown-email">{user.email || ""}</div>
                </div>
              </div>
              <div className="user-dropdown-item" onClick={() => { setOpen(false); onProfile(); }}>
                <Icon name="user" size={16} color="currentColor" strokeWidth={2} /> My Profile
              </div>
              <div className="user-dropdown-item" onClick={() => { setOpen(false); onProfile(); }}>
                <Icon name="settings" size={16} color="currentColor" strokeWidth={2} /> Settings
              </div>
              <div className="user-dropdown-divider" />
              <div className="user-dropdown-item user-dropdown-item--danger" onClick={() => { setOpen(false); onSignOut(); }}>
                <Icon name="log-out" size={16} color="currentColor" strokeWidth={2} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
