import { useState } from "react";
import { auth } from "../utils/supabase";

const AuthScreen = ({ onSubmit }) => {
  const [tab, setTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async () => {
    setError(""); setInfo("");
    const e = email.trim();
    if (!e || !password) { setError("Email aur password zaroori hai."); return; }
    if (tab === "signup" && password.length < 6) { setError("Password kam az kam 6 characters ka ho."); return; }

    setLoading(true);
    try {
      if (tab === "signup") {
        const { data, error } = await auth.signUp(e, password, name.trim());
        if (error) { setError(error.message); setLoading(false); return; }
        // If email confirmation is ON, no session yet
        if (data.session) {
          onSubmit(auth.toAppUser(data.user));
        } else {
          setInfo("Account ban gaya! Apni email check karein — verification link bheja hai. Verify karke login karein.");
          setTab("login");
        }
      } else {
        const { data, error } = await auth.signIn(e, password);
        if (error) {
          setError(error.message.includes("Invalid") ? "Email ya password ghalat hai." : error.message);
          setLoading(false);
          return;
        }
        onSubmit(auth.toAppUser(data.user));
      }
    } catch (err) {
      setError("Kuch masla hua. Dobara koshish karein.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(""); setLoading(true);
    const { error } = await auth.signInWithGoogle();
    if (error) { setError("Google login abhi available nahi. Email se login karein."); setLoading(false); }
    // On success, Supabase redirects — App will pick up the session
  };

  return (
    <div className="auth">
      <div className="auth-center">
        <a className="auth-logo" href="#">
          <svg viewBox="0 0 320 80" width="200" height="50">
            <g fill="#fff">
              <rect x="32" y="14" width="4" height="48" rx="1"/>
              <rect x="22" y="60" width="24" height="5" rx="1.5"/>
              <rect x="18" y="64" width="32" height="3" rx="1.5"/>
              <circle cx="34" cy="14" r="3"/>
              <rect x="10" y="22" width="48" height="3" rx="1.5"/>
              <path d="M14 25 L8 38" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M14 25 L20 38" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M54 25 L48 38" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M54 25 L60 38" stroke="#fff" strokeWidth="1.5" fill="none"/>
              <path d="M5 38 L23 38 L20 44 L8 44 Z"/>
              <path d="M45 38 L63 38 L60 44 L48 44 Z"/>
            </g>
            <text x="78" y="52" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize="32" fill="#fff" letterSpacing="-0.5">Lawyer Bhai AI</text>
          </svg>
        </a>

      <main className="auth-form-wrap">
        <div className="auth-form">
          <div style={{ marginBottom: 4 }}>
            <div className="auth-welcome-title" style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.01em" }}>
              {tab === "login" ? "Welcome Back" : "Account Banayein"}
            </div>
            <div className="auth-welcome-sub" style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>Pakistan ka sabse trusted AI legal assistant</div>
          </div>

          <button className="auth-google" onClick={handleGoogle} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <div className="auth-tabs">
            <button className={`auth-tab${tab === "login" ? " is-active" : ""}`} onClick={() => setTab("login")}>Login</button>
            <button className={`auth-tab${tab === "signup" ? " is-active" : ""}`} onClick={() => setTab("signup")}>Sign Up</button>
          </div>

          {tab === "signup" && (
            <label className="auth-field">
              <span>Full Name</span>
              <input className="lb-input" style={{ width: "100%" }} placeholder="Aapka Naam" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <input className="lb-input" style={{ width: "100%" }} type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-pw">
              <input className="lb-input" type={pwVisible ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
              <button type="button" className="auth-pw-toggle" onClick={() => setPwVisible((v) => !v)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round">
                  {pwVisible ? <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></> : <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>}
                </svg>
              </button>
            </div>
          </label>

          {tab === "login" && (
            <div className="auth-row">
              <label className="auth-remember"><input type="checkbox" defaultChecked /><span>Remember me</span></label>
            </div>
          )}

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 10 }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#047857", fontSize: 13, fontWeight: 600, padding: "10px 14px", borderRadius: 10, lineHeight: 1.5 }}>
              {info}
            </div>
          )}

          <button className="lb-btn lb-btn--primary auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "..." : tab === "login" ? "Login" : "Create Account"}
          </button>

          {tab === "login" && <a className="auth-forgot" href="#">Forgot your password?</a>}
        </div>
      </main>
      </div>
    </div>
  );
};

export default AuthScreen;
