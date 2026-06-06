import { useState, useEffect } from "react";
import Icon from "./Icon";
import { profileDB } from "../utils/db";

const fmtMonth = (iso) => {
  try { return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
  catch { return "—"; }
};

const ProfileTab = ({ onSignOut, user = {} }) => {
  const name = user.name || "User";
  const email = user.email || "";
  const initial = name.charAt(0).toUpperCase();

  const [stats, setStats] = useState({ documents: 0, cases: 0, activeCases: 0 });
  const [profile, setProfile] = useState({ phone: "", city: "", createdAt: null });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: "", city: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileDB.stats().then(setStats);
    profileDB.get().then((p) => {
      setProfile(p);
      setForm({ phone: p.phone || "", city: p.city || "" });
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await profileDB.update({ phone: form.phone.trim(), city: form.city.trim() });
    setSaving(false);
    if (!error) {
      setProfile((p) => ({ ...p, phone: form.phone.trim(), city: form.city.trim() }));
      setEditing(false);
    } else {
      alert("Save nahi hua. Dobara koshish karein.");
    }
  };

  return (
    <div className="profile-wrap">
      <div className="profile-card">
        <div className="profile-card-head">
          <div className="profile-big-avatar">{initial}</div>
          <div className="profile-head-info">
            <div className="profile-head-name">{name}</div>
            <div className="profile-head-email">{email}</div>
            <div className="profile-head-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              Verified Member
            </div>
          </div>
        </div>
        <div className="profile-stats-row">
          {[
            [stats.documents, "Documents"],
            [stats.cases, "Total Cases"],
            [stats.activeCases, "Active Cases"],
          ].map(([num, label]) => (
            <div key={label} className="profile-stat">
              <div className="profile-stat-num">{num}</div>
              <div className="profile-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div className="profile-section-title" style={{ margin: 0 }}>Account Information</div>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: "#0E7A45", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0 }}>Edit</button>
          )}
        </div>

        {/* Non-editable */}
        <div className="profile-field">
          <div className="profile-field-icon"><Icon name="user" size={16} color="#0E7A45" strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="profile-field-label">Full Name</div>
            <div className="profile-field-value">{name}</div>
          </div>
        </div>
        <div className="profile-field">
          <div className="profile-field-icon"><Icon name="file-text" size={16} color="#0E7A45" strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="profile-field-label">Email Address</div>
            <div className="profile-field-value">{email}</div>
          </div>
        </div>

        {/* Editable: Phone */}
        <div className="profile-field">
          <div className="profile-field-icon"><Icon name="chat" size={16} color="#0E7A45" strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="profile-field-label">Phone Number</div>
            {editing ? (
              <input className="lb-input" style={{ width: "100%", height: 38, marginTop: 4 }} placeholder="+92 3XX XXXXXXX"
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            ) : (
              <div className="profile-field-value">{profile.phone || "—"}</div>
            )}
          </div>
        </div>

        {/* Editable: City */}
        <div className="profile-field">
          <div className="profile-field-icon"><Icon name="map-pin" size={16} color="#0E7A45" strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="profile-field-label">City</div>
            {editing ? (
              <input className="lb-input" style={{ width: "100%", height: 38, marginTop: 4 }} placeholder="Karachi"
                value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            ) : (
              <div className="profile-field-value">{profile.city || "—"}</div>
            )}
          </div>
        </div>

        {/* Member since */}
        <div className="profile-field">
          <div className="profile-field-icon"><Icon name="book" size={16} color="#0E7A45" strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="profile-field-label">Member Since</div>
            <div className="profile-field-value">{fmtMonth(profile.createdAt)}</div>
          </div>
        </div>

        {editing && (
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="lb-btn" style={{ flex: 1, background: "#F3F4F6", color: "#374151" }}
              onClick={() => { setEditing(false); setForm({ phone: profile.phone || "", city: profile.city || "" }); }}>Cancel</button>
            <button className="lb-btn lb-btn--primary" style={{ flex: 1 }} onClick={saveProfile} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      <button className="profile-signout-btn" onClick={onSignOut}>
        <Icon name="log-out" size={16} color="currentColor" strokeWidth={2} /> Sign Out
      </button>
    </div>
  );
};

export default ProfileTab;
