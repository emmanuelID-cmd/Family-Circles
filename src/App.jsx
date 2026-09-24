import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import { loadFamilyData } from "./lib/familyData.js";
import { supabase } from "./lib/supabase.js";

function AuthForm() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) setMessage("Check your email to confirm your account, then sign in.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      }
    } catch (authError) {
      setError(authError.message || "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <div className="brand"><span className="brand-mark">◎</span>circles</div>
    <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
    <p className="auth-intro">Sign in to keep your circles and people saved to your account.</p>
    {mode === "signup" && <label className="auth-field">Display name<input autoComplete="name" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label>}
    <label className="auth-field">Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
    <label className="auth-field">Password<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={mode === "signup" ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {message && <p className="auth-message" role="status">{message}</p>}
    <button className="primary auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
    <p className="auth-switch">{mode === "signup" ? "Already have an account?" : "New to Circles?"} <button type="button" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setMessage(""); }}>{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
  </form></main>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [workspace, setWorkspace] = useState({ people: [], circles: [] });
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [retryIndex, setRetryIndex] = useState(0);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setDataError(error.message);
      setSession(data?.session || null);
      setAuthLoading(false);
    }).catch((error) => {
      if (active) {
        setDataError(error.message || "Could not restore your session.");
        setAuthLoading(false);
      }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const nextWorkspace = await loadFamilyData();
    setWorkspace(nextWorkspace);
    return nextWorkspace;
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setWorkspace({ people: [], circles: [] });
      setDataLoading(false);
      return undefined;
    }
    let active = true;
    const load = async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const user = session.user;
        const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Circles user";
        const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });
        if (profileError) throw profileError;
        const nextWorkspace = await loadFamilyData();
        if (active) setWorkspace(nextWorkspace);
      } catch (loadError) {
        if (active) setDataError(loadError.message || "Could not load your data.");
      } finally {
        if (active) setDataLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [session?.user?.id, retryIndex]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setDataError(error.message);
  };

  if (authLoading) return <main className="auth-shell"><p className="auth-loading">Loading your session…</p></main>;
  if (!session) return <AuthForm />;
  if (dataLoading) return <main className="auth-shell"><p className="auth-loading">Loading your circles…</p></main>;
  if (dataError) return <main className="auth-shell"><section className="auth-card"><div className="brand"><span className="brand-mark">◎</span>circles</div><h1>Couldn’t load your data</h1><p className="auth-error" role="alert">{dataError}</p><p className="auth-intro">Confirm that you ran the Supabase migration and that this project’s Row Level Security policies are enabled.</p><div className="auth-actions"><button className="primary" onClick={() => setRetryIndex((value) => value + 1)}>Retry</button><button className="secondary" onClick={signOut}>Sign out</button></div></section></main>;

  return <Dashboard people={workspace.people} circles={workspace.circles} user={session.user} onReload={refreshWorkspace} onSignOut={signOut} />;
}
