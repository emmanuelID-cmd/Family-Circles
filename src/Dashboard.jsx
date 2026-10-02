import { useEffect, useMemo, useRef, useState } from "react";
import { blockPeople, createCircles, deleteCircles, loadMessages, loadSuggestionsPage, replaceCircleMemberships, sendMessage, setFavorites, updateFollowing, updatePeople, updateProfile } from "./lib/familyData.js";
import { parseAccountSearch } from "./lib/search.js";
import { validateCircleNames } from "./lib/circleNames.js";
import ManagedAccountNameEditor from "./components/ManagedAccountNameEditor.jsx";
import ProfileMediaGrid from "./components/ProfileMediaGrid.jsx";

const CIRCLE_LIMIT = 20;
const FREE_CIRCLE_LIMIT = 10;
const notificationTypes = [
  { id: "posts", label: "Posts", icon: "▧" },
  { id: "stories", label: "Stories", icon: "◌" },
  { id: "reels", label: "Reels", icon: "▻" },
  { id: "liveVideos", label: "Live videos", icon: "◉" },
];
const notificationChoices = [
  { id: "all", label: "All", icon: "◉" },
  { id: "relevant", label: "Most relevant", icon: "◯" },
  { id: "off", label: "Off", icon: "⊘" },
];

function AvatarPlaceholder() {
  return <svg className="avatar-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M4.8 20c.7-3.4 3.1-5.2 7.2-5.2s6.5 1.8 7.2 5.2" /></svg>;
}

function PersonAvatar({ person, stacked = false, story = false }) {
  return <div className={`${stacked ? "person-avatar stacked-avatar" : "person-avatar"} ${!stacked && (story || hasStory(person)) ? "has-story" : ""}`} aria-hidden="true"><AvatarPlaceholder /></div>;
}

function hasStory(person) {
  const seed = String(person.id || person.handle || person.name).split("").reduce((total, character) => total + character.charCodeAt(0), 0);
  return seed % 4 === 0;
}

function NavigationIcon({ name }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "Home") return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></svg>;
  if (name === "Reels") return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none" /></svg>;
  if (name === "Messages") return <svg {...common}><path d="M21 3 10 14" /><path d="m21 3-7 18-4-8-8-4z" /></svg>;
  if (name === "Search") return <svg {...common}><circle cx="10.8" cy="10.8" r="7.2" /><path d="m16.2 16.2 4.3 4.3" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="9" r="3" /><path d="M6.5 19c.9-2.6 2.8-4 5.5-4s4.6 1.4 5.5 4" /></svg>;
}

function Verified({ person }) {
  return person.verified ? <span className="verified" role="img" aria-label="Verified account"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.7l2.08 1.66 2.66-.18 1.31 2.32 2.45 1.05-.1 2.66 1.66 2.08-1.66 2.08.1 2.66-2.45 1.05-1.31 2.32-2.66-.18L12 22.3l-2.08-1.66-2.66.18-1.31-2.32-2.45-1.05.1-2.66-1.66-2.08 1.66-2.08-.1-2.66 2.45-1.05 1.31-2.32 2.66.18L12 1.7z" /><path className="verified-check" d="M10.18 15.87 6.94 12.63l1.48-1.48 1.76 1.76 5.42-5.42 1.48 1.48-6.9 6.9z" /></svg></span> : null;
}

export default function Dashboard({ people, circles, accounts, accountId, user, profile, onReload, onSignOut, onSelectAccount, onAddAccount }) {
  const [tab, setTab] = useState("circles");
  const [route, setRoute] = useState("profile");
  const [query, setQuery] = useState("");
  const [active, setActive] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [circleEditor, setCircleEditor] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [notificationType, setNotificationType] = useState(null);
  const [relationshipDialog, setRelationshipDialog] = useState(null);
  const [messaging, setMessaging] = useState(null);
  const [messageRows, setMessageRows] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [circleFormOpen, setCircleFormOpen] = useState(false);
  const [circleName, setCircleName] = useState("");
  const [circleFormError, setCircleFormError] = useState("");
  const [circleLimitReview, setCircleLimitReview] = useState(false);
  const [circleDeleteOpen, setCircleDeleteOpen] = useState(false);
  const [circleDeleteIds, setCircleDeleteIds] = useState(new Set());
  const [mockPage, setMockPage] = useState("");
  const [storyPerson, setStoryPerson] = useState(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [nameEditorOpen, setNameEditorOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [accountDisplayName, setAccountDisplayName] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [accountUsernameError, setAccountUsernameError] = useState("");
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountMenuPosition, setAccountMenuPosition] = useState({ top: 0, right: 0 });
  const accountMenuRef = useRef(null);
  const accountSwitchButtonRef = useRef(null);
  const nameEditorButtonRef = useRef(null);
  const [pronounDraft, setPronounDraft] = useState("");
  const [searchHidden, setSearchHidden] = useState(false);
  const [circlesToRemove, setCirclesToRemove] = useState(new Set());
  const [circleLimitReviewError, setCircleLimitReviewError] = useState("");
  const [actionError, setActionError] = useState("");
  const [moreFor, setMoreFor] = useState(null);
  const [notificationMoreOpen, setNotificationMoreOpen] = useState(false);
  const [suggestionRows, setSuggestionRows] = useState([]);
  const [suggestionTotal, setSuggestionTotal] = useState(0);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const sentinelRef = useRef(null);
  const lastScrollY = useRef(0);
  useEffect(() => {
    if (!accountMenuOpen) return undefined;
    accountMenuRef.current?.querySelector("button")?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        accountSwitchButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [accountMenuOpen]);
  const hostName = profile?.display_name || user.user_metadata?.display_name || "Circles user";
  const hostHandle = `@${profile?.username || user.user_metadata?.username || "circlesuser"}`;
  const hostAvatar = { id: user.id, name: hostName, handle: hostHandle };

  const followedPeople = people.filter((person) => person.hostFollows && !person.blocked);
  const followers = people.filter((person) => person.followsHost && !person.blocked);
  const pendingRequests = people.filter((person) => person.pendingRequest && !person.blocked);
  const favoritePeople = people.filter((person) => person.favorite && person.hostFollows && !person.blocked);
  const search = parseAccountSearch(query, circles);
  const suggestedPreview = people.filter((person) => !person.hostFollows && !person.followsHost && !person.pendingRequest && !person.blocked && !person.dismissedAt)
    .filter((person) => !search.hasCircleTerms && (!search.personTerms.length || search.personTerms.some((term) => {
      const exactHandle = term.startsWith("@");
      const value = (exactHandle ? term.slice(1) : term).toLowerCase();
      return exactHandle ? person.username.toLowerCase() === value : `${person.name} ${person.username}`.toLowerCase().includes(value);
    }))).slice(0, 10);
  const blockedPeople = people.filter((person) => person.blocked);
  const baseList = route === "blocked" ? blockedPeople : route === "requests" ? pendingRequests : route === "favorites" ? favoritePeople : tab === "followers" ? followers : followedPeople;
  const shown = useMemo(() => {
    let list = baseList;
    const circleFilter = search.hasCircleTerms ? search.circleIds : tab === "circles" && !route ? active : [];
    if (search.hasCircleTerms && !search.circleIds.length) return [];
    if (circleFilter.length) list = list.filter((person) => person.circles.some((circle) => circleFilter.includes(circle)));
    if (search.personTerms.length) list = list.filter((person) => search.personTerms.some((term) => {
      const exactHandle = term.startsWith("@");
      const value = (exactHandle ? term.slice(1) : term).toLowerCase();
      return exactHandle ? person.username.toLowerCase() === value : `${person.name} ${person.username}`.toLowerCase().includes(value);
    }));
    if (sort !== "default") {
      const dateKey = tab === "followers" ? "followedHost" : "followedByHost";
      list = [...list].sort((a, b) => sort === "latest" ? (b[dateKey] || "").localeCompare(a[dateKey] || "") : (a[dateKey] || "").localeCompare(b[dateKey] || ""));
    }
    return list;
  }, [baseList, tab, route, active, search.personTerms, search.circleIds, search.hasCircleTerms, sort]);
  const selectedPeople = people.filter((person) => selected.has(person.id));
  const visibleRows = route === "suggestions" ? suggestionRows : shown;
  const allShownSelected = visibleRows.length > 0 && visibleRows.every((person) => selected.has(person.id));
  const someShownSelected = visibleRows.some((person) => selected.has(person.id)) && !allShownSelected;
  const memberCounts = people.reduce((counts, person) => { person.circles.forEach((id) => { counts[id] = (counts[id] || 0) + 1; }); return counts; }, {});

  const clearSelection = () => setSelected(new Set());
  const resolveTargets = (person) => selected.size ? [...selected] : [person.id];
  const toggleSelected = (id, checked) => setSelected((current) => { const next = new Set(current); checked ? next.add(id) : next.delete(id); return next; });
  const toggleAllShown = (checked) => setSelected((current) => { const next = new Set(current); visibleRows.forEach((person) => checked ? next.add(person.id) : next.delete(person.id)); return next; });
  const navigate = (nextRoute = null) => { setRoute(nextRoute); setMockPage(""); setStoryPerson(null); clearSelection(); setMoreFor(null); setNotificationMoreOpen(false); setQuery(""); setActionError(""); setCircleFormError(""); };
  const navigateToTab = (nextTab) => { setTab(nextTab); navigate(); };
  const openMockPage = (name) => { setMockPage(name); setRoute(null); setActionError(""); clearSelection(); setMoreFor(null); setQuery(""); };
  const showStory = (person) => setStoryPerson(person);
  const scrollToPosts = () => document.getElementById("profile-posts")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const selectTab = (nextTab) => { setTab(nextTab); setRoute(null); clearSelection(); setMoreFor(null); setActionError(""); setCircleFormError(""); };
  const toggleCircle = (id) => setActive((current) => current.includes(id) ? current.filter((circle) => circle !== id) : [...current, id]);
  const toggleCircleDelete = (id, checked) => setCircleDeleteIds((current) => { const next = new Set(current); checked ? next.add(id) : next.delete(id); return next; });
  const removeSelectedCircles = async () => {
    if (!circleDeleteIds.size) return;
    if (await reloadAfter(() => deleteCircles(accountId, [...circleDeleteIds]))) {
      setActive((current) => current.filter((id) => !circleDeleteIds.has(id)));
      setCircleDeleteOpen(false);
      setCircleDeleteIds(new Set());
    }
  };
  const savePronouns = async (event) => {
    event.preventDefault();
    if (await reloadAfter(() => updateProfile(accountId, { pronouns: pronounDraft.trim() || null }))) setProfileEditorOpen(false);
  };

  const removeSuggestions = (ids) => {
    if (!ids.length || route !== "suggestions") return;
    setSuggestionRows((rows) => rows.filter((person) => !ids.includes(person.id)));
    setSuggestionTotal((total) => Math.max(0, total - ids.length));
  };
  const reloadAfter = async (operation, suggestionIds = []) => {
    setActionError("");
    try { await operation(); await onReload(); removeSuggestions(suggestionIds); clearSelection(); return true; }
    catch (error) { setActionError(error.message); return false; }
  };
  const openCircleEditor = (person) => {
    const ids = resolveTargets(person);
    setCircleEditor({ ids, draft: Object.fromEntries(people.filter((item) => ids.includes(item.id)).map((item) => [item.id, [...item.circles]])), error: null });
  };
  const saveCircleEditor = async () => {
    const proposed = people.map((person) => circleEditor.ids.includes(person.id) ? { ...person, circles: circleEditor.draft[person.id] } : person);
    const counts = proposed.reduce((result, person) => { person.circles.forEach((id) => { result[id] = (result[id] || 0) + 1; }); return result; }, {});
    const overflow = circles.find((circle) => (counts[circle.id] || 0) > CIRCLE_LIMIT);
    if (overflow) {
      const current = memberCounts[overflow.id] || 0;
      const proposedCount = counts[overflow.id];
      setCircleEditor({ ...circleEditor, error: { id: overflow.id, current, proposed: proposedCount, needed: proposedCount - CIRCLE_LIMIT } });
      return;
    }
    if (await reloadAfter(() => replaceCircleMemberships(accountId, circleEditor.ids, circleEditor.draft, people))) setCircleEditor(null);
  };
  const toggleEditorCircle = (circleId, checked) => setCircleEditor((editor) => ({ ...editor, error: null, draft: Object.fromEntries(editor.ids.map((id) => [id, checked ? [...new Set([...editor.draft[id], circleId])] : editor.draft[id].filter((item) => item !== circleId)])) }));
  const openNotificationEditor = (person, allFollowed = false) => {
    const ids = allFollowed ? followedPeople.map((item) => item.id) : resolveTargets(person);
    const source = people.find((item) => item.id === ids[0]);
    setViewing({ ids, preferences: source?.notifications || { posts: "all", stories: "off", reels: "off", liveVideos: "off" } });
  };
  const chooseNotification = (type, value) => {
    setViewing((current) => ({ ...current, preferences: { ...current.preferences, [type]: value } }));
    setNotificationType(null);
  };
  const saveNotification = async () => {
    if (await reloadAfter(() => updatePeople(accountId, viewing.ids, { notification_settings: viewing.preferences }))) setViewing(null);
  };
  const openMessage = async (person) => {
    clearSelection();
    setMessaging(person);
    setActionError("");
    try { setMessageRows(await loadMessages(accountId, person.id)); } catch (error) { setActionError(error.message); }
  };
  const submitMessage = async (event) => {
    event.preventDefault();
    try {
      const message = await sendMessage(accountId, messaging.id, messageDraft);
      setMessageRows((rows) => [...rows, message]);
      setMessageDraft("");
    } catch (error) { setActionError(error.message); }
  };
  const handleMore = async (person, action) => {
    setMoreFor(null);
    const ids = resolveTargets(person);
    const suggestionIds = route === "suggestions" ? ids : [];
    if (action === "dismiss") return reloadAfter(() => updatePeople(accountId, ids, { suggestion_dismissed_at: new Date().toISOString() }), suggestionIds);
    if (action === "block") return setRelationshipDialog({ ids, kind: "block", suggestionIds });
    if (action === "favorite") return reloadAfter(() => setFavorites(accountId, ids, !person.favorite), suggestionIds);
  };
  const confirmRelationship = async () => {
    const { ids, kind } = relationshipDialog;
    const success = kind === "unfollow"
      ? await reloadAfter(() => updateFollowing(accountId, ids, false))
      : kind === "block"
        ? await reloadAfter(() => blockPeople(accountId, ids), relationshipDialog.suggestionIds || [])
      : await reloadAfter(() => updatePeople(accountId, ids, { pending_follow_request: false, person_follows_account: true, followed_account_at: new Date().toISOString() }));
    if (success) setRelationshipDialog(null);
  };
  const actionFor = (person, suggested = false) => {
    if (route === "blocked") return ["Unblock"];
    if (route === "requests") return ["Confirm", "Delete"];
    if (route === "favorites") return ["Following", "Message"];
    if (suggested) return [person.followsHost ? "Follow Back" : "Follow"];
    if (tab === "circles") return ["View", "Circle", "Unfollow"];
    if (tab === "following") return ["Following", "Message"];
    return [person.hostFollows ? "Following" : "Follow Back"];
  };
  const handleAction = async (person, action) => {
    if (action === "View") return openNotificationEditor(person);
    if (action === "Circle") return openCircleEditor(person);
    if (action === "Message") return openMessage(person);
    if (action === "Unfollow" || action === "Following") return setRelationshipDialog({ ids: resolveTargets(person), kind: "unfollow" });
    if (action === "Confirm") return setRelationshipDialog({ ids: resolveTargets(person), kind: "confirm" });
    if (action === "Delete") return reloadAfter(() => updatePeople(accountId, resolveTargets(person), { pending_follow_request: false }));
    if (action === "Unblock") return reloadAfter(() => updatePeople(accountId, resolveTargets(person), { is_blocked: false }));
    const ids = resolveTargets(person);
    return reloadAfter(() => updateFollowing(accountId, ids, true), route === "suggestions" ? ids : []);
  };
  const submitCircle = async (event) => {
    event.preventDefault();
    const availableSlots = Math.max(0, FREE_CIRCLE_LIMIT - circles.length);
    const validation = validateCircleNames(circleName, circles.map((circle) => circle.name), availableSlots);
    if (validation.error) {
      setCircleFormError(validation.error);
      return;
    }
    setCircleFormError("");
    try {
      await createCircles(accountId, validation.names);
      await onReload();
      clearSelection();
      setCircleName("");
      setCircleFormOpen(false);
    } catch (error) {
      setCircleFormError(error.message);
    }
  };
  const excessCircleCount = Math.max(0, circles.length - FREE_CIRCLE_LIMIT);
  const openCircleLimitReview = () => {
    setCirclesToRemove(new Set());
    setCircleLimitReviewError("");
    setCircleLimitReview(true);
  };
  const toggleCircleForRemoval = (id, checked) => setCirclesToRemove((current) => {
    const next = new Set(current);
    checked ? next.add(id) : next.delete(id);
    return next;
  });
  const removeExcessCircles = async () => {
    if (circlesToRemove.size !== excessCircleCount) {
      setCircleLimitReviewError(`Select exactly ${excessCircleCount} circle${excessCircleCount === 1 ? "" : "s"} to remove.`);
      return;
    }
    if (await reloadAfter(() => deleteCircles(accountId, [...circlesToRemove]))) {
      setCircleLimitReview(false);
      setCircleFormOpen(false);
      setCircleFormError("");
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 150 && currentY > lastScrollY.current + 3) setSearchHidden(true);
      else if (currentY < lastScrollY.current - 3 || currentY <= 150) setSearchHidden(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (route !== "suggestions") return undefined;
    let activeRequest = true;
    setSuggestionRows([]);
    setSuggestionLoading(true);
    loadSuggestionsPage({ accountId, query, from: 0 }).then(({ rows, total }) => {
      if (activeRequest) { setSuggestionRows(rows); setSuggestionTotal(total); }
    }).catch((error) => activeRequest && setActionError(error.message)).finally(() => activeRequest && setSuggestionLoading(false));
    return () => { activeRequest = false; };
  }, [route, query, accountId]);
  useEffect(() => {
    if (route !== "suggestions" || !sentinelRef.current || suggestionRows.length >= suggestionTotal) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || suggestionLoading) return;
      setSuggestionLoading(true);
      loadSuggestionsPage({ accountId, query, from: suggestionRows.length }).then(({ rows }) => setSuggestionRows((current) => [...current, ...rows])).catch((error) => setActionError(error.message)).finally(() => setSuggestionLoading(false));
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [route, query, accountId, suggestionRows.length, suggestionTotal, suggestionLoading]);

  const renderRow = (person, suggested = false) => {
    const profileHref = `#/user/${encodeURIComponent(person.username)}`;
    return <article className={`reference-row ${tab === "circles" && !route ? "circle-row" : "relationship-row"} ${suggested ? "suggested-row" : ""}`} key={person.id}>
    <input className="check" type="checkbox" checked={selected.has(person.id)} onChange={(event) => toggleSelected(person.id, event.target.checked)} aria-label={`Select ${person.name}`} />
    {hasStory(person) ? <button className="account-story-button" onClick={() => showStory(person)} aria-label={`Open ${person.name}'s story`}><PersonAvatar person={person} /></button> : <a className="account-profile-avatar-link" href={profileHref} aria-label={`Open ${person.name}'s profile`}><PersonAvatar person={person} /></a>}
    <div className="person-info"><strong><a className="person-profile-link person-name" href={profileHref}>{person.name}</a><Verified person={person} /></strong><a className="person-profile-link person-profile-handle" href={profileHref}>{person.handle}</a></div>
    {tab === "circles" && !route && !suggested && <div className="chips">{person.circles.map((id) => <span className="chip" key={id}>{circles.find((circle) => circle.id === id)?.name}</span>)}</div>}
    <div className="row-actions">{actionFor(person, suggested).map((action) => <button key={action} onClick={() => handleAction(person, action)}>{action}</button>)}
      {route !== "blocked" && (suggested || tab !== "circles" || route === "favorites") && <div className="more-wrap"><button className="more-button" onClick={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setMoreFor(moreFor?.person.id === person.id ? null : { person, suggested, top: bounds.bottom + 8, right: window.innerWidth - bounds.right }); }} aria-label={`More options for ${person.name}`} aria-expanded={moreFor?.person.id === person.id} aria-haspopup="menu">⋮</button></div>}
    </div>
    </article>;
  };

  if (messaging) {
    return <main className="message-page"><header className="message-topbar"><button className="mock-back" onClick={() => setMessaging(null)} aria-label="Back to account views">←</button><PersonAvatar person={messaging} /><div className="message-recipient"><strong><span className="person-name">{messaging.name}</span><Verified person={messaging} /></strong><span>{messaging.handle}</span></div></header><section className="message-profile"><div className="message-photo-placeholder"><PersonAvatar person={messaging} /></div><h1><span className="person-name">{messaging.name}</span><Verified person={messaging} /></h1><p>{messaging.handle}</p><p>{messaging.followers} followers · {messaging.posts} posts</p><p>You followed this account since {messaging.followedByHost?.slice(0, 10) || "recently"}</p><div className="mutuals"><span className="mutual-avatar-stack" aria-hidden="true"><span><AvatarPlaceholder /></span><span><AvatarPlaceholder /></span><span><AvatarPlaceholder /></span></span><span>Followed by user1, user2 and others</span></div></section><section className="message-history">{messageRows.map((message) => <p className="sent-message" key={message.id}>{message.body}</p>)}</section>{actionError && <p className="action-error" role="alert">{actionError}</p>}<form className="message-composer" onSubmit={submitMessage}><button type="button" className="composer-camera" aria-label="Camera">◉</button><input value={messageDraft} maxLength={2000} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Message..." aria-label={`Message ${messaging.name}`} /><button type="button" aria-label="Voice message">♩</button><button type="button" aria-label="Choose image">▧</button><button type="submit" disabled={!messageDraft.trim()} aria-label="Send message">＋</button></form></main>;
  }

  const routeTitle = route === "suggestions" ? "Suggested users" : route === "requests" ? "Follow requests" : route === "favorites" ? "Favorites" : route === "blocked" ? "Blocked" : null;
  const isDialogOpen = Boolean(circleEditor || viewing || notificationType || relationshipDialog || circleFormOpen || circleLimitReview || circleDeleteOpen || profileEditorOpen || nameEditorOpen || accountFormOpen);
  const isInteractionLocked = isDialogOpen || Boolean(moreFor || accountMenuOpen);
  const submitManagedAccount = async (event) => {
    event.preventDefault();
    setAccountBusy(true);
    setActionError("");
    setAccountUsernameError("");
    try {
      await onAddAccount({ displayName: accountDisplayName, username: accountUsername });
      setAccountFormOpen(false);
      setAccountDisplayName("");
      setAccountUsername("");
      setRoute("profile");
    } catch (error) {
      if (error.code === "23505" || /managed_accounts.*username|username.*unique/i.test(error.message || "")) {
        setAccountUsernameError("That username is already used by another profile under this login.");
      } else {
        setActionError(error.message || "Could not add this profile.");
      }
    } finally {
      setAccountBusy(false);
    }
  };
  if (storyPerson) return <main className="story-view"><div className="story-canvas" role="button" tabIndex={0} aria-label={`Story from ${storyPerson.name}. Click anywhere to return.`} onClick={() => setStoryPerson(null)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setStoryPerson(null); } }}><div className="story-progress"><span /></div><div className="story-account"><PersonAvatar person={storyPerson} story /><span><strong>{storyPerson.name}</strong><small>{storyPerson.handle}</small></span><Verified person={storyPerson} /></div><p>Under mockup version this feature is not accessible.</p></div></main>;
  return <main className="shell"><div className={`reference-shell ${route === "profile" ? "profile-shell" : ""}`} inert={isInteractionLocked ? "" : undefined}>{route !== "profile" && !mockPage && <section className="reference-header"><div className="reference-account-row"><button className="mock-back" onClick={() => navigate("profile")} aria-label="Back to profile">←</button><span className="account-handle">{hostHandle}</span><div className="header-actions"><button className="person-add-action" onClick={() => openMockPage("Discover People")} aria-label="Open Discover People"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20v-1.5a6.5 6.5 0 0 1 13 0V20M19 8v8M15 12h8"/></svg></button>{tab === "circles" && !route && <><button className="favorites-link" onClick={() => navigate("favorites")} aria-label="View favorites">★ Favorites</button><button className="manage-btn" onClick={() => { setCircleFormError(""); setCircleFormOpen(true); }} aria-label="Create a circle">＋ Circle</button><button className="manage-btn delete-circle-trigger" onClick={() => { setCircleDeleteIds(new Set()); setCircleDeleteOpen(true); }} aria-label="Delete circles">− Circle</button></>}</div></div></section>}
    {route === "profile" && <section className="host-profile-page">
      <header className="host-profile-toolbar">
        <button type="button" className="host-post-create" onClick={scrollToPosts} aria-label="Create post">+</button>
        <div className="host-profile-handle"><span>{hostHandle}</span><span className="host-privacy-state" aria-label="Privacy status unavailable in this preview" title="Privacy status unavailable in this preview"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg><small aria-hidden="true">?</small></span></div>
        <button type="button" className="host-toolbar-icon muse-icon" onClick={() => openMockPage("Muse")} aria-label="Open Muse"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 18.5c-2.7 0-4.5-2-4.5-4.8V9.9c0-2.7 1.8-4.5 4.5-4.5 2.6 0 4.1 1.8 5.5 4.2l2 3.3c1.4 2.3 2.6 3.6 4.5 3.6 2.2 0 3.5-1.7 3.5-4.1V9.5c0-2.5-1.3-4.1-3.5-4.1-1.7 0-3.2 1.2-4.6 3.5l-2.1 3.5c-1.6 2.7-3.1 6.1-5.3 6.1Z"/></svg></button>
        <button type="button" className="host-toolbar-icon host-settings-button" onClick={() => openMockPage("Settings")} aria-label="Open settings"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
      </header>
      <div className="host-profile-summary">
        <button className="story-avatar-button" onClick={() => showStory(hostAvatar)} aria-label="Open your story"><PersonAvatar person={hostAvatar} story /></button>
        <div className="host-profile-details">
          <div className="host-identity-line"><h1 className="host-name-line">{hostName}</h1>{profile?.pronouns && <small className="host-pronouns">{profile.pronouns}</small>}<button ref={accountSwitchButtonRef} className="account-switch-trigger" aria-label="Switch profile or add account" aria-expanded={accountMenuOpen} aria-haspopup="menu" onClick={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setAccountMenuPosition({ top: bounds.bottom + 8, right: window.innerWidth - bounds.right }); setAccountMenuOpen((open) => !open); }}>⌄</button></div>
          <div className="profile-stat-grid"><button onClick={scrollToPosts}><strong>0</strong><span>Posts</span></button><button onClick={() => navigateToTab("circles")}><strong>{circles.length}</strong><span>Circles</span></button><button onClick={() => navigateToTab("followers")}><strong>{followers.length}</strong><span>Followers</span></button><button onClick={() => navigateToTab("following")}><strong>{followedPeople.length}</strong><span>Following</span></button></div>
        </div>
      </div>
      <div className="host-profile-edit-actions"><button ref={nameEditorButtonRef} className="edit-pronouns" onClick={() => setNameEditorOpen(true)}>Edit names</button><button className="edit-pronouns" onClick={() => { setPronounDraft(profile?.pronouns || ""); setProfileEditorOpen(true); }}>{profile?.pronouns ? "Edit pronouns" : "Add pronouns"}</button></div>
      <ProfileMediaGrid id="profile-posts" items={{}} emptyMessages={{ posts: "No posts are accessible under the mock version.", reels: "Reels are a mockup preview and are not accessible.", reposts: "Reposts are a mockup preview and are not accessible.", tagged: "Photos and videos of you are a mockup preview and are not accessible." }} />
    </section>}
    {mockPage === "Discover People" ? <section className="discover-page"><div className="discover-page-heading"><button className="mock-back" onClick={() => { setMockPage(""); navigate(); }} aria-label="Back to account views">←</button><h1>Discover people</h1></div><label className="search-wrap discover-search"><span aria-hidden="true">⌕</span><input className="reference-search" placeholder="Search username or display name" aria-label="Search username or display name" /></label><div className="connect-contacts-row"><span className="contacts-icon" aria-hidden="true">▣</span><span><strong>Connect contacts</strong><small>No one</small></span><button className="connect-contacts-button" onClick={() => setActionError("Under mockup version this feature is not accessible.")}>Connect</button></div>{actionError && <p className="action-error" role="status">{actionError}</p>}</section> : mockPage === "Settings" ? <section className="mock-settings-page"><div className="discover-page-heading"><button className="mock-back" onClick={() => { setMockPage(""); navigate("profile"); }} aria-label="Back to Profile">←</button><h1>Settings</h1></div><button onClick={() => { setMockPage(""); setNameEditorOpen(true); }}>Account <span>Edit name and username</span></button><button onClick={() => { setMockPage(""); navigate("blocked"); }}>Blocking <span>Manage blocked accounts</span></button><button onClick={() => { setMockPage(""); setAccountFormOpen(true); }}>Add account <span>Add another profile</span></button><button onClick={onSignOut}>Log out</button></section> : mockPage && <section className="mock-navigation-page"><button className="mock-back" onClick={() => { setMockPage(""); navigate("profile"); }} aria-label="Back to Profile">←</button><h1>{mockPage}</h1><p>Under mockup version this feature is not accessible.</p><button className="secondary" onClick={() => navigate("profile")}>User Profile Page</button></section>}
    {!mockPage && route !== "profile" && (route ? <div className="subpage-heading"><button className="mock-back" onClick={() => navigate()} aria-label="Back to account views">←</button><h1>{routeTitle}</h1></div> : <nav className="reference-tabs sticky-tabs" inert={sortOpen ? "" : undefined} aria-label="Account views">{[{ id: "circles", label: "Circles", count: circles.length }, { id: "followers", label: "Followers", count: followers.length }, { id: "following", label: "Following", count: followedPeople.length }].map((view) => <button key={view.id} className={`reference-tab ${tab === view.id ? "active" : ""}`} onClick={() => selectTab(view.id)}><strong>{view.count}</strong> {view.label}</button>)}</nav>)}
    {!mockPage && route !== "profile" && <><div className={`reference-tools ${searchHidden ? "search-hidden" : ""}`}><label className="search-wrap"><span aria-hidden="true">⌕</span><input className="reference-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search names, @username, or @Circle:Name; separate with commas" aria-label="Search accounts and circles" /></label><div className="sort-wrap"><button className="reference-sort" onClick={() => setSortOpen(!sortOpen)} aria-expanded={sortOpen} aria-haspopup="dialog">⇅ Sort</button>{sortOpen && <div className="sort-panel" role="dialog" aria-label="Sort by"><h3>Sort by</h3>{[{ id: "default", label: "Default" }, { id: "latest", label: "Date followed: Latest" }, { id: "earliest", label: "Date followed: Earliest" }].map((option) => <label key={option.id} className="sort-option"><input type="radio" name="sort" checked={sort === option.id} onChange={() => { setSort(option.id); setSortOpen(false); }} />{option.label}</label>)}</div>}</div></div>
    <div className="tab-slot">{tab === "circles" && !route ? <div className="filter-row">{circles.map((circle) => <button key={circle.id} className={`filter ${(search.hasCircleTerms ? search.circleIds : active).includes(circle.id) ? "selected" : ""}`} onClick={() => toggleCircle(circle.id)}>{circle.name}</button>)}</div> : <span aria-hidden="true" />}</div>
    {actionError && <p className="action-error" role="alert">{actionError}</p>}
    <div className="selection-bar"><label><input type="checkbox" checked={allShownSelected} ref={(input) => { if (input) input.indeterminate = someShownSelected; }} onChange={(event) => toggleAllShown(event.target.checked)} aria-label="Select all visible accounts" />Select all</label><span className="selection-count">{selected.size} selected</span></div>
    <div className="reference-list">{visibleRows.map((person) => renderRow(person, route === "suggestions"))}</div>
    {route === "suggestions" && <div ref={sentinelRef} className="suggestion-sentinel">{suggestionLoading ? "Loading more suggestions…" : suggestionRows.length >= suggestionTotal ? "You are up to date." : "Scroll for more"}</div>}
    {!route && <><section className="request-preview"><div className="section-heading"><h3>Follow requests</h3><button onClick={() => navigate("requests")}>See all</button></div>{pendingRequests.length ? <div className="request-cards"><div className="avatar-stack">{pendingRequests.slice(0, 3).map((person) => <PersonAvatar person={person} stacked key={person.id} />)}</div><p>{pendingRequests.length} private account request{pendingRequests.length === 1 ? "" : "s"}</p><button onClick={() => navigate("requests")}>Review</button></div> : <p className="empty-state">No pending follow requests.</p>}</section><section className="suggested-section"><div className="section-heading"><h3>Suggested users</h3><button onClick={() => navigate("suggestions")}>See all</button></div><div className="reference-list">{suggestedPreview.map((person) => renderRow(person, true))}</div></section></>}</>}
  </div>{moreFor && <><div className="menu-scrim" aria-hidden="true" /><div className="more-menu floating-more-menu" role="menu" style={{ top: moreFor.top, right: moreFor.right }}><button role="menuitem" onClick={() => handleMore(moreFor.person, "favorite")}>{moreFor.person.favorite ? "Remove from favorites" : "Add to favorites"}</button>{moreFor.suggested && <button role="menuitem" onClick={() => handleMore(moreFor.person, "dismiss")}>Dismiss</button>}<button role="menuitem" onClick={() => handleMore(moreFor.person, "block")}>Block</button><button role="menuitem" className="menu-cancel" onClick={() => setMoreFor(null)}>Cancel</button></div></>}{sortOpen && !isInteractionLocked && <div className="sort-scrim" aria-hidden="true" />}{isDialogOpen && <div className="modal-scrim" aria-hidden="true" />}
  {circleEditor && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setCircleEditor(null)} aria-label="Close circle manager">×</button><p className="eyebrow">CIRCLE MANAGER</p><h2>{circleEditor.ids.length} selected {circleEditor.ids.length === 1 ? "person" : "people"}</h2>{actionError && <p className="action-error" role="alert">{actionError}</p>}{circleEditor.error && <p id="capacity-error" className="capacity-error" role="alert">{circles.find((circle) => circle.id === circleEditor.error.id)?.name} has {circleEditor.error.current} / {CIRCLE_LIMIT} members. This change would make it {circleEditor.error.proposed} / {CIRCLE_LIMIT}; remove at least {circleEditor.error.needed} member{circleEditor.error.needed === 1 ? "" : "s"} before saving.</p>}{circles.map((circle) => { const states = circleEditor.ids.map((id) => circleEditor.draft[id].includes(circle.id)); const checked = states.every(Boolean); const mixed = states.some(Boolean) && !checked; return <label className={`manage-row ${circleEditor.error?.id === circle.id ? "capacity-invalid" : ""}`} key={circle.id}><span><input type="checkbox" checked={checked} ref={(input) => { if (input) input.indeterminate = mixed; }} onChange={(event) => toggleEditorCircle(circle.id, event.target.checked)} aria-describedby={circleEditor.error?.id === circle.id ? "capacity-error" : undefined} />{circle.name}</span><small>{memberCounts[circle.id] || 0} / {CIRCLE_LIMIT} members</small></label>; })}<div className="dialog-actions"><button className="secondary" onClick={() => setCircleEditor(null)}>Cancel</button><button className="primary" onClick={saveCircleEditor}>Save Changes</button></div></div></dialog>}
  {viewing && <dialog open className="modal notification-modal" aria-modal="true"><div className="modal-form" inert={notificationMoreOpen ? "" : undefined}><button className="close" onClick={() => { setNotificationMoreOpen(false); setViewing(null); }} aria-label="Close notifications">×</button><div className="notification-title"><div><p className="eyebrow">NOTIFICATIONS</p><h2>Notifications from {viewing.ids.length === 1 ? people.find((person) => person.id === viewing.ids[0])?.username : "profiles you follow"}</h2></div><div className="notification-more-wrap"><button className="more-button" onClick={() => setNotificationMoreOpen((open) => !open)} aria-label="More notification actions" aria-expanded={notificationMoreOpen} aria-haspopup="menu">⋮</button></div></div>{actionError && <p className="action-error" role="alert">{actionError}</p>}{notificationTypes.map((type) => <button className="notification-row" key={type.id} onClick={() => setNotificationType(type.id)}><span className="notification-icon">{type.icon}</span><span><strong>{type.label}</strong><small>{notificationChoices.find((choice) => choice.id === viewing.preferences[type.id])?.label}</small></span><b>›</b></button>)}<button className="notification-row all-followed" onClick={() => openNotificationEditor(null, true)}><span className="notification-icon">☷</span><span><strong>All profiles you follow</strong></span><b>›</b></button><div className="dialog-actions"><button className="secondary" onClick={() => { setActionError(""); setNotificationMoreOpen(false); setViewing(null); }}>Cancel</button><button className="primary" onClick={saveNotification}>Save Changes</button></div></div>{notificationMoreOpen && <div className="more-menu notification-more-menu notification-floating-menu" role="menu"><button role="menuitem" onClick={() => { setNotificationMoreOpen(false); setViewing(null); setRelationshipDialog({ ids: viewing.ids, kind: "block" }); }}>Block</button><button role="menuitem" className="menu-cancel" onClick={() => setNotificationMoreOpen(false)}>Cancel</button></div>}</dialog>}
  {notificationType && <dialog open className="modal choice-modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setNotificationType(null)} aria-label="Close notification choices">×</button><h2>{notificationTypes.find((type) => type.id === notificationType)?.label}</h2>{actionError && <p className="action-error" role="alert">{actionError}</p>}{notificationChoices.map((choice) => <button className={`notification-choice ${viewing.preferences[notificationType] === choice.id ? "chosen" : ""}`} key={choice.id} onClick={() => chooseNotification(notificationType, choice.id)}><span>{choice.icon}</span>{choice.label}{viewing.preferences[notificationType] === choice.id && <b>✓</b>}</button>)}</div></dialog>}
  {relationshipDialog && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => { setActionError(""); setRelationshipDialog(null); }} aria-label="Close relationship confirmation">×</button><p className="eyebrow">RELATIONSHIP CHANGE</p><h2>{relationshipDialog.kind === "unfollow" ? "Unfollow" : relationshipDialog.kind === "block" ? "Block" : "Confirm"} {relationshipDialog.ids.length} {relationshipDialog.ids.length === 1 ? "person" : "people"}?</h2><p className="dialog-copy">{relationshipDialog.kind === "unfollow" ? "This updates your saved relationship list. It does not unfollow anyone on Instagram." : relationshipDialog.kind === "block" ? "Blocked accounts are removed from Following, Favorites, and private circles. You can restore them from the Blocked list." : "This accepts the private follow request in this prototype."}</p>{actionError && <p className="action-error" role="alert">{actionError}</p>}<div className="dialog-actions"><button className="secondary" onClick={() => { setActionError(""); setRelationshipDialog(null); }}>Cancel</button><button className={`primary ${relationshipDialog.kind === "block" ? "danger" : ""}`} onClick={confirmRelationship}>{relationshipDialog.kind === "unfollow" ? "Unfollow" : relationshipDialog.kind === "block" ? "Block" : "Confirm"}</button></div></div></dialog>}
  {circleFormOpen && <dialog open className="modal" aria-modal="true"><form className="modal-form" onSubmit={submitCircle}><button type="button" className="close" onClick={() => setCircleFormOpen(false)} aria-label="Close circle form">×</button><p className="eyebrow">CIRCLE MANAGER</p><h2>Create a circle</h2>{circleFormError && <p id="circle-form-error" className="action-error" role="alert">{circleFormError}</p>}<label className="auth-field">Circle name<input autoFocus maxLength={500} value={circleName} onChange={(event) => { const value = event.target.value; setCircleName(value); const validation = validateCircleNames(value, circles.map((circle) => circle.name), Math.max(0, FREE_CIRCLE_LIMIT - circles.length)); if (!validation.error) setCircleFormError(""); }} className={circleFormError ? "field-invalid" : undefined} aria-required="true" aria-describedby={circleFormError ? "circle-form-error" : "circle-name-help"} /></label><small id="circle-name-help" className="field-help">Separate names with commas. Each name can be up to 40 characters. Example: Family, Friends</small><div className="dialog-actions"><button type="button" className="secondary" onClick={() => setCircleFormOpen(false)}>Cancel</button>{circles.length > FREE_CIRCLE_LIMIT ? <button className="primary" type="button" onClick={openCircleLimitReview}>Review circles</button> : <button className="primary" type="submit">Create circle</button>}</div></form></dialog>}
  {circleLimitReview && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setCircleLimitReview(false)} aria-label="Close circle limit review">×</button><p className="eyebrow">CIRCLE LIMIT</p><h2>Choose {excessCircleCount} circle{excessCircleCount === 1 ? "" : "s"} to remove</h2><p className="dialog-copy">Free accounts can keep up to {FREE_CIRCLE_LIMIT} circles. Removing a circle also removes its private memberships; it does not unfollow anyone.</p>{circleLimitReviewError && <p className="action-error" role="alert">{circleLimitReviewError}</p>}{actionError && <p className="action-error" role="alert">{actionError}</p>}<div className="circle-removal-list">{circles.map((circle) => <label className="manage-row" key={circle.id}><span><input type="checkbox" checked={circlesToRemove.has(circle.id)} onChange={(event) => { toggleCircleForRemoval(circle.id, event.target.checked); setCircleLimitReviewError(""); }} />{circle.name}</span><small>{memberCounts[circle.id] || 0} members</small></label>)}</div><p className="selection-count">{circlesToRemove.size} of {excessCircleCount} selected</p><div className="dialog-actions"><button className="secondary" onClick={() => setCircleLimitReview(false)}>Cancel</button><button className="primary danger" onClick={removeExcessCircles}>Remove selected circles</button></div></div></dialog>}
  <nav className="bottom-nav" inert={isInteractionLocked || sortOpen ? "" : undefined} aria-label="Main navigation">{["Home", "Reels", "Messages", "Search", "Profile"].map((name) => <button key={name} className={(route === "profile" && name === "Profile") || mockPage === name ? "active" : ""} onClick={() => name === "Profile" ? navigate("profile") : name === "Reels" ? (window.location.hash = "/reels") : openMockPage(name)}>{name === "Profile" ? <PersonAvatar person={hostAvatar} /> : <span className={`nav-icon nav-icon-${name.toLowerCase()}`}><NavigationIcon name={name} /></span>}{name}</button>)}</nav>
  {profileEditorOpen && <dialog open className="modal" aria-modal="true"><form className="modal-form" onSubmit={savePronouns}><button type="button" className="close" onClick={() => { setActionError(""); setProfileEditorOpen(false); }} aria-label="Close profile editor">×</button><p className="eyebrow">PROFILE</p><h2>Edit pronouns</h2>{actionError && <p className="action-error" role="alert">{actionError}</p>}<label className="auth-field">Pronouns<input autoFocus maxLength={40} value={pronounDraft} onChange={(event) => setPronounDraft(event.target.value)} placeholder="e.g. they/them" /></label><div className="dialog-actions"><button type="button" className="secondary" onClick={() => { setActionError(""); setProfileEditorOpen(false); }}>Cancel</button><button type="submit" className="primary">Save Changes</button></div></form></dialog>}
  {nameEditorOpen && <ManagedAccountNameEditor accountId={accountId} profile={profile} returnFocusRef={nameEditorButtonRef} onClose={() => setNameEditorOpen(false)} onSaved={onReload} />}
  {circleDeleteOpen && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => { setActionError(""); setCircleDeleteOpen(false); }} aria-label="Close delete circles">×</button><p className="eyebrow">CIRCLE MANAGER</p><h2>Delete circles</h2><p className="dialog-copy">Deleting a circle also removes its memberships, but does not unfollow anyone. This cannot be undone.</p>{actionError && <p className="action-error" role="alert">{actionError}</p>}<div className="circle-removal-list">{circles.map((circle) => <label className="manage-row" key={circle.id}><span><input type="checkbox" checked={circleDeleteIds.has(circle.id)} onChange={(event) => toggleCircleDelete(circle.id, event.target.checked)} />{circle.name}</span><small>{memberCounts[circle.id] || 0} members</small></label>)}</div><p className="selection-count">{circleDeleteIds.size} selected</p><div className="dialog-actions"><button className="secondary" onClick={() => { setActionError(""); setCircleDeleteOpen(false); }}>Cancel</button><button className="primary danger" disabled={!circleDeleteIds.size} onClick={removeSelectedCircles}>Delete selected</button></div></div></dialog>}
  {accountMenuOpen && <><button className="account-menu-scrim" aria-label="Close account menu" onClick={() => { setAccountMenuOpen(false); accountSwitchButtonRef.current?.focus(); }} /><div ref={accountMenuRef} className="account-menu" role="menu" aria-label="Switch profile" style={{ top: accountMenuPosition.top, right: accountMenuPosition.right }} onKeyDown={(event) => { if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return; const items = [...event.currentTarget.querySelectorAll('[role="menuitemradio"], [role="menuitem"]')]; const index = items.indexOf(document.activeElement); const next = event.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length; event.preventDefault(); items[next]?.focus(); }}>{accounts.map((account) => <button key={account.id} role="menuitemradio" aria-checked={account.id === accountId} className={account.id === accountId ? "active-account" : ""} onClick={() => { setAccountMenuOpen(false); if (account.id !== accountId) onSelectAccount(account.id); }}><span>{account.display_name}</span><small>{account.username ? `@${account.username}` : "No username"}{account.id === accountId ? " · Current" : ""}</small></button>)}<button className="account-menu-add" role="menuitem" onClick={() => { setAccountMenuOpen(false); setActionError(""); setAccountUsernameError(""); setAccountFormOpen(true); }}>＋ Add account</button></div></>}
  {accountFormOpen && <dialog open className="modal" aria-modal="true" aria-labelledby="managed-account-title"><form className="modal-form" onSubmit={submitManagedAccount}><button type="button" className="close" onClick={() => { setActionError(""); setAccountFormOpen(false); }} aria-label="Close add profile form">×</button><p className="eyebrow">LINKED PROFILE</p><h2 id="managed-account-title">Add account</h2><p className="dialog-copy">Create another profile under this login. Its follows, followers, circles, and messages start separately.</p>{actionError && <p className="action-error" role="alert">{actionError}</p>}<label className="auth-field">Display name<input autoFocus autoComplete="off" maxLength={80} value={accountDisplayName} onChange={(event) => setAccountDisplayName(event.target.value)} required aria-describedby="managed-name-help" /></label><small id="managed-name-help" className="field-help">Required · up to 80 characters</small><label className="auth-field">Username (optional)<input autoComplete="off" maxLength={30} pattern="[A-Za-z0-9._]{1,30}" value={accountUsername} onChange={(event) => { setAccountUsername(event.target.value); setAccountUsernameError(""); }} className={accountUsernameError ? "field-invalid" : undefined} placeholder="username" aria-describedby={accountUsernameError ? "managed-username-error" : "managed-username-help"} /></label>{accountUsernameError ? <small id="managed-username-error" className="field-error" role="alert">{accountUsernameError}</small> : <small id="managed-username-help" className="field-help">1–30 letters, numbers, periods, or underscores</small>}<div className="dialog-actions"><button type="button" className="secondary" onClick={() => { setActionError(""); setAccountUsernameError(""); setAccountFormOpen(false); }}>Cancel</button><button type="submit" className="primary" disabled={accountBusy}>{accountBusy ? "Creating…" : "Create profile"}</button></div></form></dialog>}
  </main>;
}
