import { useCallback, useEffect, useState } from "react";
import Dashboard from "./Dashboard.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import { createManagedAccount, ensureProfileAvatar, loadFamilyData, loadManagedAccounts } from "./lib/familyData.js";
import { supabase } from "./lib/supabase.js";

function getUserProfileRoute() {
  const match = window.location.hash.match(/^#\/user\/([^/?]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function AuthForm() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
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
            data: { display_name: displayName.trim(), pronouns: pronouns.trim() },
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
    {mode === "signup" && <><label className="auth-field">Display name<input autoComplete="name" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label><label className="auth-field">Pronouns (optional)<input maxLength={40} value={pronouns} onChange={(event) => setPronouns(event.target.value)} placeholder="e.g. they/them" /></label></>}
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
  const [userProfileUsername, setUserProfileUsername] = useState(getUserProfileRoute);
  const [authLoading, setAuthLoading] = useState(true);
  const [workspace, setWorkspace] = useState({ people: [], circles: [], profile: null, accounts: [] });
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [retryIndex, setRetryIndex] = useState(0);

  useEffect(() => {
    const syncProfileRoute = () => setUserProfileUsername(getUserProfileRoute());
    window.addEventListener("hashchange", syncProfileRoute);
    return () => window.removeEventListener("hashchange", syncProfileRoute);
  }, []);

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
    if (!activeAccountId) return null;
    const nextWorkspace = await loadFamilyData(activeAccountId);
    setWorkspace((current) => ({ ...nextWorkspace, accounts: current.accounts }));
    return nextWorkspace;
  }, [activeAccountId]);

  useEffect(() => {
    if (!session?.user) {
      setWorkspace({ people: [], circles: [], profile: null, accounts: [] });
      setActiveAccountId(null);
      setDataLoading(false);
      return undefined;
    }
    let active = true;
    const load = async () => {
      setDataLoading(true);
      setDataError("");
      try {
        const user = session.user;
        const displayName = user.user_metadata?.display_name || "Circles user";
        const profile = { id: user.id, display_name: displayName };
        if (user.user_metadata?.pronouns) profile.pronouns = user.user_metadata.pronouns;
        const { error: profileError } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });
        if (profileError) throw profileError;
        await ensureProfileAvatar(user.id);
        const accounts = await loadManagedAccounts();
        const storageKey = `family-circles-active-account:${user.id}`;
        const savedId = window.localStorage.getItem(storageKey);
        const selected = accounts.find((account) => account.id === savedId) || accounts.find((account) => account.is_default) || accounts[0];
        if (!selected) throw new Error("No managed profile is available for this login.");
        const nextWorkspace = await loadFamilyData(selected.id);
        if (active) {
          window.localStorage.setItem(storageKey, selected.id);
          setActiveAccountId(selected.id);
          setWorkspace({ ...nextWorkspace, accounts });
        }
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

  const selectAccount = async (accountId) => {
    if (accountId === activeAccountId) return;
    if (!workspace.accounts.some((account) => account.id === accountId)) throw new Error("That profile is not available under this login.");
    setDataLoading(true);
    setDataError("");
    try {
      const nextWorkspace = await loadFamilyData(accountId);
      window.localStorage.setItem(`family-circles-active-account:${session.user.id}`, accountId);
      setActiveAccountId(accountId);
      setWorkspace((current) => ({ ...nextWorkspace, accounts: current.accounts }));
    } catch (error) {
      setDataError(error.message || "Could not switch profiles.");
    } finally {
      setDataLoading(false);
    }
  };

  const addAccount = async (details) => {
    const account = await createManagedAccount(details);
    setWorkspace((current) => ({ ...current, accounts: [...current.accounts, account] }));
    const nextWorkspace = await loadFamilyData(account.id);
    setWorkspace((current) => ({ ...nextWorkspace, accounts: current.accounts.some((item) => item.id === account.id) ? current.accounts : [...current.accounts, account] }));
    window.localStorage.setItem(`family-circles-active-account:${session.user.id}`, account.id);
    setActiveAccountId(account.id);
    return account;
  };

  if (authLoading) return <main className="auth-shell"><p className="auth-loading">Loading your session…</p></main>;
  if (!session) return <AuthForm />;
  if (dataLoading) return <main className="auth-shell"><p className="auth-loading">Loading your circles…</p></main>;
  if (dataError) return <main className="auth-shell"><section className="auth-card"><div className="brand"><span className="brand-mark">◎</span>circles</div><h1>Couldn’t load your data</h1><p className="auth-error" role="alert">{dataError}</p><p className="auth-intro">Confirm that you ran the Supabase migration and that this project’s Row Level Security policies are enabled.</p><div className="auth-actions"><button className="primary" onClick={() => setRetryIndex((value) => value + 1)}>Retry</button><button className="secondary" onClick={signOut}>Sign out</button></div></section></main>;

  if (userProfileUsername) {
    const person = workspace.people.find((item) => item.username.toLowerCase() === userProfileUsername.toLowerCase());
    const profile = person ? {
      username: person.username,
      name: person.name,
      posts: person.posts,
      followers: person.followers,
      followingCount: person.following,
      bio: person.bio,
    } : {
      username: userProfileUsername,
      name: userProfileUsername === "marko.was" ? "Marko Was" : "User profile",
      posts: userProfileUsername === "marko.was" ? "250" : "0",
      followers: userProfileUsername === "marko.was" ? "683" : "0",
      followingCount: userProfileUsername === "marko.was" ? "1,062" : "0",
      bio: userProfileUsername === "marko.was" ? "Fashion. AI models. Infinite looks." : "Profile preview",
    };
    return <UserProfile profile={profile} onBack={() => { window.location.hash = "/"; }} />;
  }

  return <Dashboard people={workspace.people} circles={workspace.circles} accounts={workspace.accounts} accountId={activeAccountId} user={session.user} profile={workspace.profile} onReload={refreshWorkspace} onSignOut={signOut} onSelectAccount={selectAccount} onAddAccount={addAccount} />;
}
