import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import { preloadAvatar } from "./utils/avatarPreloader";
import { supabase, auth } from "./utils/supabase";
import "./styles/main.css";

const App = () => {
  const [screen, setScreen] = useState("splash");
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState({ name: "", email: "" });
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => { preloadAvatar(); }, []);

  // Restore session on load + listen for auth changes (login/logout/OAuth redirect)
  useEffect(() => {
    auth.getSession().then((session) => {
      if (session?.user) setUser(auth.toAppUser(session.user));
      setCheckedSession(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(auth.toAppUser(session.user));
        setScreen((s) => (s === "dash" ? s : "dash"));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    setUser({ name: "", email: "" });
    setScreen("splash");
  };

  // Splash finishes → if already logged in, skip auth → dash
  const handleSplashDone = () => {
    if (user.email) setScreen("dash");
    else setScreen("auth");
  };

  if (screen === "splash") return <SplashScreen onContinue={handleSplashDone} />;
  if (screen === "auth")   return <AuthScreen onSubmit={(u) => { setUser(u); setScreen("dash"); }} />;
  return (
    <Dashboard
      lang={lang} setLang={setLang}
      onSignOut={handleSignOut}
      user={user}
    />
  );
};

export default App;
