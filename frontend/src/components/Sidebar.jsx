import Icon from "./Icon";

const NAV_ITEMS = [
  { id: "home",        icon: "home",      label: ["Home"] },
  { id: "legal-guide", icon: "book-open", label: ["Legal", "Guide"] },
  { id: "docs",        icon: "file-text", label: ["Documents"] },
  { id: "lawbook",     icon: "book",      label: ["Law", "Book"] },
  { id: "my-cases",    icon: "briefcase", label: ["My", "Cases"] },
  { id: "find-vakeel", icon: "users",     label: ["Find", "Vakeel"] },
];

const Sidebar = ({ active, onSelect }) => (
  <nav className="sidebar">
    {NAV_ITEMS.map(({ id, icon, label }) => (
      <button
        key={id}
        className={`side-item${active === id ? " is-active" : ""}`}
        onClick={() => onSelect(id)}
      >
        <Icon name={icon} size={22} strokeWidth={1.75} />
        <span className="side-label">{label.map((w, i) => <span key={i}>{w}</span>)}</span>
      </button>
    ))}
  </nav>
);

export default Sidebar;
