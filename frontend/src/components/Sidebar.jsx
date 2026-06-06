import Icon from "./Icon";
import { useT } from "../utils/i18n.jsx";

const NAV_ITEMS = [
  { id: "home",        icon: "home",      key: "nav.home" },
  { id: "legal-guide", icon: "book-open", key: "nav.legalGuide" },
  { id: "docs",        icon: "file-text", key: "nav.documents" },
  { id: "lawbook",     icon: "book",      key: "nav.lawBook" },
  { id: "my-cases",    icon: "briefcase", key: "nav.myCases" },
  { id: "find-vakeel", icon: "users",     key: "nav.findVakeel" },
];

const Sidebar = ({ active, onSelect }) => {
  const { t } = useT();
  return (
    <nav className="sidebar">
      {NAV_ITEMS.map(({ id, icon, key }) => (
        <button
          key={id}
          className={`side-item${active === id ? " is-active" : ""}`}
          onClick={() => onSelect(id)}
        >
          <Icon name={icon} size={22} strokeWidth={1.75} />
          <span className="side-label">{t(key)}</span>
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;
