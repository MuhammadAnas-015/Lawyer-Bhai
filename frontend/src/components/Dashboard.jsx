import { useState } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import FloatingChat from "./FloatingChat";
import HomeTab from "./HomeTab";
import LegalGuideTab from "./LegalGuideTab";
import ProfileTab from "./ProfileTab";
import SettingsTab from "./SettingsTab";

// Lazy-loaded tabs
import { lazy, Suspense } from "react";
const DocsTab        = lazy(() => import("./DocsTab"));
const LawBookTab     = lazy(() => import("./LawBookTab"));
const MyCasesTab     = lazy(() => import("./MyCasesTab"));
const FindVakeelTab  = lazy(() => import("./FindVakeelTab"));

const Loader = () => (
  <div style={{ padding: 48, textAlign: "center", color: "#9CA3AF" }}>
    <div className="char-3d-spinner" style={{ margin: "0 auto 12px" }} />
    Loading…
  </div>
);

const Dashboard = ({ lang, setLang, onSignOut, user }) => {
  const [activeNav, setActiveNav] = useState("home");
  const isUr = lang === "ur";
  const firstName = user.name ? user.name.split(" ")[0] : "Aap";

  const renderMain = () => {
    switch (activeNav) {
      case "home":        return <HomeTab onNavigate={setActiveNav} firstName={firstName} />;
      case "legal-guide": return <LegalGuideTab lang={lang} />;
      case "docs":        return <Suspense fallback={<Loader />}><DocsTab lang={lang} /></Suspense>;
      case "lawbook":     return <Suspense fallback={<Loader />}><LawBookTab /></Suspense>;
      case "my-cases":    return <Suspense fallback={<Loader />}><MyCasesTab /></Suspense>;
      case "find-vakeel": return <Suspense fallback={<Loader />}><FindVakeelTab /></Suspense>;
      case "profile":     return <ProfileTab onSignOut={onSignOut} user={user} />;
      case "settings":    return <SettingsTab lang={lang} setLang={setLang} onSignOut={onSignOut} user={user} />;
      default:            return <HomeTab onNavigate={setActiveNav} firstName={firstName} />;
    }
  };

  return (
    <div className={`app${isUr ? " is-rtl" : ""}`}>
      <TopBar lang={lang} setLang={setLang} onSignOut={onSignOut}
        onProfile={() => setActiveNav("profile")}
        onSettings={() => setActiveNav("settings")} user={user} />
      <div className="shell">
        <Sidebar active={activeNav} onSelect={setActiveNav} />
        <main className="main">{renderMain()}</main>
      </div>
      <FloatingChat />
    </div>
  );
};

export default Dashboard;
