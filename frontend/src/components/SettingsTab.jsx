import { useState } from "react";
import Icon from "./Icon";
import { profileDB } from "../utils/db";
import { useT } from "../utils/i18n.jsx";

const SettingsTab = ({ lang, setLang, onSignOut, user = {} }) => {
  const { t } = useT();
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [notif, setNotif] = useState({ email: true, updates: true });

  const changePassword = async () => {
    setPwMsg({ type: "", text: "" });
    if (pw.next.length < 6) { setPwMsg({ type: "err", text: t("set.pwShort") }); return; }
    if (pw.next !== pw.confirm) { setPwMsg({ type: "err", text: t("set.pwMismatch") }); return; }
    setPwSaving(true);
    const { error } = await profileDB.changePassword(pw.next);
    setPwSaving(false);
    if (error) setPwMsg({ type: "err", text: error.message });
    else { setPwMsg({ type: "ok", text: t("set.pwChanged") }); setPw({ next: "", confirm: "" }); }
  };

  const Section = ({ title, children }) => (
    <div className="profile-section" style={{ maxWidth: 640 }}>
      <div className="profile-section-title">{title}</div>
      {children}
    </div>
  );

  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{
      width: 44, height: 26, borderRadius: 99, border: "none", cursor: "pointer", flexShrink: 0,
      background: on ? "#0E7A45" : "#D1D5DB", position: "relative", transition: "background 160ms",
    }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 160ms", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
    </button>
  );

  return (
    <div className="profile-wrap">
      <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>{t("set.title")}</h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: "#6B7280" }}>{t("set.subtitle")}</p>

      {/* Language */}
      <Section title={t("set.language")}>
        <div style={{ display: "flex", gap: 10 }}>
          {[["en", "English"], ["ur", "اردو"]].map(([code, label]) => (
            <button key={code} onClick={() => setLang(code)}
              style={{
                flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15,
                border: lang === code ? "2px solid #0E7A45" : "1.5px solid #E5E7EB",
                background: lang === code ? "#F0FDF4" : "#fff",
                color: lang === code ? "#0E7A45" : "#374151",
                fontFamily: code === "ur" ? "Noto Nastaliq Urdu, sans-serif" : "inherit",
              }}>
              {label} {lang === code && "✓"}
            </button>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section title={t("set.notifications")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F9FAFB" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{t("set.emailNotif")}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{t("set.emailNotifDesc")}</div>
          </div>
          <Toggle on={notif.email} onClick={() => setNotif((n) => ({ ...n, email: !n.email }))} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{t("set.productUpdates")}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{t("set.productUpdatesDesc")}</div>
          </div>
          <Toggle on={notif.updates} onClick={() => setNotif((n) => ({ ...n, updates: !n.updates }))} />
        </div>
      </Section>

      {/* Change Password */}
      <Section title={t("set.changePw")}>
        <input className="lb-input" style={{ width: "100%", marginBottom: 10 }} type="password" placeholder={t("set.newPw")}
          value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        <input className="lb-input" style={{ width: "100%", marginBottom: 12 }} type="password" placeholder={t("set.confirmPw")}
          value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
        {pwMsg.text && (
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, padding: "8px 12px", borderRadius: 8,
            background: pwMsg.type === "ok" ? "#ECFDF5" : "#FEF2F2",
            color: pwMsg.type === "ok" ? "#047857" : "#DC2626" }}>
            {pwMsg.text}
          </div>
        )}
        <button className="lb-btn lb-btn--primary" style={{ width: "100%" }} onClick={changePassword} disabled={pwSaving || !pw.next}>
          {pwSaving ? t("set.updating") : t("set.updatePw")}
        </button>
      </Section>

      {/* Account */}
      <Section title={t("set.account")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{t("set.signedInAs")}</div>
            <div style={{ fontSize: 13, color: "#6B7280" }}>{user.email}</div>
          </div>
          <button onClick={onSignOut} style={{ background: "#FEF2F2", color: "#EF4444", border: "1.5px solid #FECACA", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="log-out" size={14} color="currentColor" strokeWidth={2} /> {t("menu.signout")}
          </button>
        </div>
      </Section>

      <div style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 8, paddingBottom: 8 }}>
        Lawyer Bhai AI · v1.0 · Pakistan ka AI Legal Assistant
      </div>
    </div>
  );
};

export default SettingsTab;
