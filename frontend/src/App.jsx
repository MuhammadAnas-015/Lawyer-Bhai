import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { preloadAvatar } from "./utils/avatarPreloader";
import "./styles/main.css";

const App = () => {
  const [screen, setScreen] = useState("splash");
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => { preloadAvatar(); }, []);

  if (screen === "splash") return <SplashScreen onContinue={() => setScreen("auth")} />;
  if (screen === "auth")   return <AuthScreen onSubmit={(u) => { setUser(u); setScreen("dash"); }} />;
  return (
    <Dashboard
      lang={lang} setLang={setLang}
      onSignOut={() => setScreen("splash")}
      user={user}
    />
  );
};

export default App;
