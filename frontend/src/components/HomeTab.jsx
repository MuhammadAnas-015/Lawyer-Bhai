import CharacterBanner from "./CharacterBanner";
import Icon from "./Icon";
import { useT } from "../utils/i18n.jsx";

const HomeTab = ({ onNavigate, firstName = "Aap" }) => {
  const { t } = useT();
  return (
    <div className="home-wrap">
      <CharacterBanner />

      <div className="home-inner">
        <div className="home-greet">
          <h1>{t("home.greeting")}, {firstName}!</h1>
          <p>{t("home.subtitle")}</p>
        </div>

        <div className="home-main-actions">
          <div className="main-action-card main-action-card--green" onClick={() => onNavigate("docs")}>
            <div className="main-action-icon">
              <Icon name="file-text" size={32} color="#0E7A45" strokeWidth={1.5} />
            </div>
            <div className="main-action-content">
              <div className="main-action-title">{t("home.docTitle")}</div>
              <div className="main-action-desc">{t("home.docDesc")}</div>
            </div>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </div>

          <div className="main-action-card main-action-card--blue" onClick={() => onNavigate("legal-guide")}>
            <div className="main-action-icon" style={{ background: "#EFF6FF" }}>
              <Icon name="chat" size={32} color="#3B82F6" strokeWidth={1.5} />
            </div>
            <div className="main-action-content">
              <div className="main-action-title">{t("home.guideTitle")} <span className="main-action-badge">{t("home.mashwara")}</span></div>
              <div className="main-action-desc">{t("home.guideDesc")}</div>
            </div>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
