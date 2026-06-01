import CharacterBanner from "./CharacterBanner";
import Icon from "./Icon";

const HomeTab = ({ onNavigate, firstName = "Aap" }) => (
  <div className="home-wrap">
    <CharacterBanner />

    <div className="home-inner">
      <div className="home-greet">
        <h1>Assalam-o-Alaikum, {firstName}!</h1>
        <p>Pakistan ka sabse trusted AI legal assistant — aapki khidmat mein haazir hai</p>
      </div>

      <div className="home-main-actions">
        <div className="main-action-card main-action-card--green" onClick={() => onNavigate("docs")}>
          <div className="main-action-icon">
            <Icon name="file-text" size={32} color="#0E7A45" strokeWidth={1.5} />
          </div>
          <div className="main-action-content">
            <div className="main-action-title">Document Upload</div>
            <div className="main-action-desc">Contract ya dastavaiz upload karein — AI risk, clauses aur summary batayega</div>
          </div>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </div>

        <div className="main-action-card main-action-card--blue" onClick={() => onNavigate("legal-guide")}>
          <div className="main-action-icon" style={{ background: "#EFF6FF" }}>
            <Icon name="chat" size={32} color="#3B82F6" strokeWidth={1.5} />
          </div>
          <div className="main-action-content">
            <div className="main-action-title">Legal Guide <span className="main-action-badge">Mashwara</span></div>
            <div className="main-action-desc">Apna masla poochein — Lawyer Bhai AI Pakistani law ke mutabiq jawab dega</div>
          </div>
          <Icon name="chevron-right" size={20} color="#9CA3AF" />
        </div>
      </div>
    </div>
  </div>
);

export default HomeTab;
