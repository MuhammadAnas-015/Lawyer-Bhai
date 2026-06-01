import Icon from "./Icon";

const ProfileTab = ({ onSignOut, user = {} }) => {
  const name = user.name || "User";
  const email = user.email || "";
  const initial = name.charAt(0).toUpperCase();

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
          {[["12", "Documents"], ["38", "Questions Asked"], ["3", "Active Cases"]].map(([num, label]) => (
            <div key={label} className="profile-stat">
              <div className="profile-stat-num">{num}</div>
              <div className="profile-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Account Information</div>
        {[
          { icon: "user", label: "Full Name", value: name },
          { icon: "file-text", label: "Email Address", value: email },
          { icon: "chat", label: "Phone Number", value: "+92 300 1234567" },
          { icon: "book", label: "Member Since", value: "January 2025" },
        ].map(({ icon, label, value }) => (
          <div key={label} className="profile-field">
            <div className="profile-field-icon"><Icon name={icon} size={16} color="#0E7A45" strokeWidth={2} /></div>
            <div style={{ flex: 1 }}>
              <div className="profile-field-label">{label}</div>
              <div className="profile-field-value">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Location</div>
        <div className="profile-field">
          <div className="profile-field-icon"><Icon name="map-pin" size={16} color="#0E7A45" strokeWidth={2} /></div>
          <div style={{ flex: 1 }}>
            <div className="profile-field-label">City</div>
            <div className="profile-field-value">Karachi, Pakistan</div>
          </div>
        </div>
      </div>

      <button className="profile-signout-btn" onClick={onSignOut}>
        <Icon name="log-out" size={16} color="currentColor" strokeWidth={2} /> Sign Out
      </button>
    </div>
  );
};

export default ProfileTab;
