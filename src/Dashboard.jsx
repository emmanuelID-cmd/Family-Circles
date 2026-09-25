import { useEffect, useMemo, useRef, useState } from "react";
import { blockPeople, createCircle, deleteCircles, loadMessages, loadSuggestionsPage, replaceCircleMemberships, sendMessage, setFavorites, updateFollowing, updatePeople } from "./lib/familyData.js";

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

function PersonAvatar({ person, stacked = false }) {
  return <div className={stacked ? "person-avatar stacked-avatar" : "person-avatar"} style={{ background: person.color }}>{person.name.split(" ").map((part) => part[0]).join("")}</div>;
}

function Verified({ person }) {
  return person.verified ? <span className="verified" role="img" aria-label="Verified account"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.7l2.08 1.66 2.66-.18 1.31 2.32 2.45 1.05-.1 2.66 1.66 2.08-1.66 2.08.1 2.66-2.45 1.05-1.31 2.32-2.66-.18L12 22.3l-2.08-1.66-2.66.18-1.31-2.32-2.45-1.05.1-2.66-1.66-2.08 1.66-2.08-.1-2.66 2.45-1.05 1.31-2.32 2.66.18L12 1.7z" /><path className="verified-check" d="M10.18 15.87 6.94 12.63l1.48-1.48 1.76 1.76 5.42-5.42 1.48 1.48-6.9 6.9z" /></svg></span> : null;
}

export default function Dashboard({ people, circles, user, onReload, onSignOut }) {
  const [tab, setTab] = useState("circles");
  const [route, setRoute] = useState(null);
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
  const [light, setLight] = useState(false);
  const [sort, setSort] = useState("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [circleFormOpen, setCircleFormOpen] = useState(false);
  const [circleName, setCircleName] = useState("");
  const [circleFormError, setCircleFormError] = useState("");
  const [circleLimitReview, setCircleLimitReview] = useState(false);
  const [circlesToRemove, setCirclesToRemove] = useState(new Set());
  const [circleLimitReviewError, setCircleLimitReviewError] = useState("");
  const [actionError, setActionError] = useState("");
  const [moreFor, setMoreFor] = useState(null);
  const [notificationMoreOpen, setNotificationMoreOpen] = useState(false);
  const [suggestionRows, setSuggestionRows] = useState([]);
  const [suggestionTotal, setSuggestionTotal] = useState(0);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const sentinelRef = useRef(null);

  const followedPeople = people.filter((person) => person.hostFollows && !person.blocked);
  const followers = people.filter((person) => person.followsHost && !person.blocked);
  const pendingRequests = people.filter((person) => person.pendingRequest && !person.blocked);
  const favoritePeople = people.filter((person) => person.favorite && person.hostFollows && !person.blocked);
  const suggestedPreview = people.filter((person) => !person.hostFollows && !person.followsHost && !person.pendingRequest && !person.blocked && !person.dismissedAt)
    .filter((person) => `${person.name} ${person.handle}`.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10);
  const blockedPeople = people.filter((person) => person.blocked);
  const baseList = route === "blocked" ? blockedPeople : route === "requests" ? pendingRequests : route === "favorites" ? favoritePeople : tab === "followers" ? followers : followedPeople;
  const shown = useMemo(() => {
    let list = baseList;
    if (tab === "circles" && !route && active.length) list = list.filter((person) => person.circles.some((circle) => active.includes(circle)));
    list = list.filter((person) => `${person.name} ${person.handle}`.toLowerCase().includes(query.toLowerCase().trim()));
    if (sort !== "default") {
      const dateKey = tab === "followers" ? "followedHost" : "followedByHost";
      list = [...list].sort((a, b) => sort === "latest" ? (b[dateKey] || "").localeCompare(a[dateKey] || "") : (a[dateKey] || "").localeCompare(b[dateKey] || ""));
    }
    return list;
  }, [baseList, tab, route, active, query, sort]);
  const selectedPeople = people.filter((person) => selected.has(person.id));
  const visibleRows = route === "suggestions" ? suggestionRows : shown;
  const allShownSelected = visibleRows.length > 0 && visibleRows.every((person) => selected.has(person.id));
  const someShownSelected = visibleRows.some((person) => selected.has(person.id)) && !allShownSelected;
  const memberCounts = people.reduce((counts, person) => { person.circles.forEach((id) => { counts[id] = (counts[id] || 0) + 1; }); return counts; }, {});

  const clearSelection = () => setSelected(new Set());
  const resolveTargets = (person) => selected.size ? [...selected] : [person.id];
  const toggleSelected = (id, checked) => setSelected((current) => { const next = new Set(current); checked ? next.add(id) : next.delete(id); return next; });
  const toggleAllShown = (checked) => setSelected((current) => { const next = new Set(current); visibleRows.forEach((person) => checked ? next.add(person.id) : next.delete(person.id)); return next; });
  const navigate = (nextRoute = null) => { setRoute(nextRoute); clearSelection(); setMoreFor(null); setNotificationMoreOpen(false); setQuery(""); };
  const selectTab = (nextTab) => { setTab(nextTab); setRoute(null); clearSelection(); setMoreFor(null); };
  const toggleCircle = (id) => setActive((current) => current.includes(id) ? current.filter((circle) => circle !== id) : [...current, id]);

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
    if (await reloadAfter(() => replaceCircleMemberships(circleEditor.ids, circleEditor.draft, people))) setCircleEditor(null);
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
    if (await reloadAfter(() => updatePeople(viewing.ids, { notification_settings: viewing.preferences }))) setViewing(null);
  };
  const openMessage = async (person) => {
    clearSelection();
    setMessaging(person);
    setActionError("");
    try { setMessageRows(await loadMessages(person.id)); } catch (error) { setActionError(error.message); }
  };
  const submitMessage = async (event) => {
    event.preventDefault();
    try {
      const message = await sendMessage(messaging.id, messageDraft);
      setMessageRows((rows) => [...rows, message]);
      setMessageDraft("");
    } catch (error) { setActionError(error.message); }
  };
  const handleMore = async (person, action) => {
    setMoreFor(null);
    const ids = resolveTargets(person);
    const suggestionIds = route === "suggestions" ? ids : [];
    if (action === "dismiss") return reloadAfter(() => updatePeople(ids, { suggestion_dismissed_at: new Date().toISOString() }), suggestionIds);
    if (action === "block") return setRelationshipDialog({ ids, kind: "block", suggestionIds });
    if (action === "favorite") return reloadAfter(() => setFavorites(ids, !person.favorite), suggestionIds);
  };
  const confirmRelationship = async () => {
    const { ids, kind } = relationshipDialog;
    const success = kind === "unfollow"
      ? await reloadAfter(() => updateFollowing(ids, false))
      : kind === "block"
        ? await reloadAfter(() => blockPeople(ids), relationshipDialog.suggestionIds || [])
      : await reloadAfter(() => updatePeople(ids, { pending_follow_request: false, follows_host: true, followed_host: new Date().toISOString() }));
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
    if (action === "Delete") return reloadAfter(() => updatePeople(resolveTargets(person), { pending_follow_request: false }));
    if (action === "Unblock") return reloadAfter(() => updatePeople(resolveTargets(person), { is_blocked: false }));
    const ids = resolveTargets(person);
    return reloadAfter(() => updateFollowing(ids, true), route === "suggestions" ? ids : []);
  };
  const submitCircle = async (event) => {
    event.preventDefault();
    if (circles.length >= FREE_CIRCLE_LIMIT) {
      setCircleFormError("You cannot exceed 10 free circles without upgrading. Upgrade options are not available in this prototype.");
      return;
    }
    if (!circleName.trim()) {
      setCircleFormError("Enter a circle name before creating it.");
      return;
    }
    setCircleFormError("");
    try {
      await createCircle(circleName);
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
    if (await reloadAfter(() => deleteCircles([...circlesToRemove]))) {
      setCircleLimitReview(false);
      setCircleFormOpen(false);
      setCircleFormError("");
    }
  };

  useEffect(() => {
    if (route !== "suggestions") return undefined;
    let activeRequest = true;
    setSuggestionRows([]);
    setSuggestionLoading(true);
    loadSuggestionsPage({ query, from: 0 }).then(({ rows, total }) => {
      if (activeRequest) { setSuggestionRows(rows); setSuggestionTotal(total); }
    }).catch((error) => activeRequest && setActionError(error.message)).finally(() => activeRequest && setSuggestionLoading(false));
    return () => { activeRequest = false; };
  }, [route, query]);
  useEffect(() => {
    if (route !== "suggestions" || !sentinelRef.current || suggestionRows.length >= suggestionTotal) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || suggestionLoading) return;
      setSuggestionLoading(true);
      loadSuggestionsPage({ query, from: suggestionRows.length }).then(({ rows }) => setSuggestionRows((current) => [...current, ...rows])).catch((error) => setActionError(error.message)).finally(() => setSuggestionLoading(false));
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [route, query, suggestionRows.length, suggestionTotal, suggestionLoading]);

  const renderRow = (person, suggested = false) => <article className={`reference-row ${tab === "circles" && !route ? "circle-row" : "relationship-row"} ${suggested ? "suggested-row" : ""}`} key={person.id}>
    <input className="check" type="checkbox" checked={selected.has(person.id)} onChange={(event) => toggleSelected(person.id, event.target.checked)} aria-label={`Select ${person.name}`} />
    <PersonAvatar person={person} />
    <div className="person-info"><strong><span className="person-name">{person.name}</span><Verified person={person} /></strong><span>{person.handle}</span></div>
    {tab === "circles" && !route && !suggested && <div className="chips">{person.circles.map((id) => <span className="chip" key={id}>{circles.find((circle) => circle.id === id)?.name}</span>)}</div>}
    <div className="row-actions">{actionFor(person, suggested).map((action) => <button key={action} onClick={() => handleAction(person, action)}>{action}</button>)}
      {route !== "blocked" && (suggested || tab !== "circles" || route === "favorites") && <div className="more-wrap"><button className="more-button" onClick={(event) => { const bounds = event.currentTarget.getBoundingClientRect(); setMoreFor(moreFor?.person.id === person.id ? null : { person, suggested, top: bounds.bottom + 8, right: window.innerWidth - bounds.right }); }} aria-label={`More options for ${person.name}`} aria-expanded={moreFor?.person.id === person.id} aria-haspopup="menu">⋮</button></div>}
    </div>
  </article>;

  if (messaging) {
    const mutuals = messaging.follows.filter((id) => followedPeople.some((person) => person.id === id)).map((id) => people.find((person) => person.id === id)).filter(Boolean);
    return <main className="message-page"><header className="message-topbar"><button className="message-back" onClick={() => setMessaging(null)} aria-label="Back to account views">←</button><PersonAvatar person={messaging} /><div className="message-recipient"><strong><span className="person-name">{messaging.name}</span><Verified person={messaging} /></strong><span>{messaging.handle}</span></div></header><section className="message-profile"><div className="message-photo-placeholder"><PersonAvatar person={messaging} /></div><h1><span className="person-name">{messaging.name}</span><Verified person={messaging} /></h1><p>{messaging.handle}</p><p>{messaging.followers} followers · {messaging.posts} posts</p><p>You followed this account since {messaging.followedByHost?.slice(0, 10) || "recently"}</p>{mutuals.length > 0 && <p className="mutuals">Followed by you and {mutuals.slice(0, 3).map((person) => person.name).join(", ")}</p>}</section><section className="message-history">{messageRows.map((message) => <p className="sent-message" key={message.id}>{message.body}</p>)}</section>{actionError && <p className="action-error" role="alert">{actionError}</p>}<form className="message-composer" onSubmit={submitMessage}><button type="button" className="composer-camera" aria-label="Camera">◉</button><input value={messageDraft} maxLength={2000} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Message..." aria-label={`Message ${messaging.name}`} /><button type="button" aria-label="Voice message">♩</button><button type="button" aria-label="Choose image">▧</button><button type="submit" disabled={!messageDraft.trim()} aria-label="Send message">＋</button></form></main>;
  }

  const routeTitle = route === "suggestions" ? "Suggested users" : route === "requests" ? "Follow requests" : route === "favorites" ? "Favorites" : route === "blocked" ? "Blocked" : null;
  const isDialogOpen = Boolean(circleEditor || viewing || notificationType || relationshipDialog || circleFormOpen || circleLimitReview);
  const isInteractionLocked = isDialogOpen || Boolean(moreFor);
  return <main className={light ? "shell light" : "shell dark"}><div className="reference-shell" inert={isInteractionLocked ? "" : undefined}><header className="topbar"><div className="brand"><span className="brand-mark">◎</span>circles</div><span className="signed-in-user">{user.email}</span><button className="theme-toggle" onClick={() => setLight(!light)} aria-label="Toggle color theme">{light ? "☾" : "☼"}</button><button className="sign-out-btn" onClick={onSignOut}>Sign out</button></header>
    <section className="reference-header"><div className="reference-profile"><div className="reference-profile-avatar">{(user.user_metadata?.display_name || user.email || "U")[0].toUpperCase()}</div><div><h2>{user.user_metadata?.display_name || user.email}</h2><p>Your private account view</p><p>{followers.length} Followers · {followedPeople.length} Following</p></div></div><div className="header-actions"><button className="favorites-link" onClick={() => navigate("favorites")} aria-label="View favorites">★ Favorites</button><button className="manage-btn" onClick={() => { setCircleFormError(""); setCircleFormOpen(true); }} aria-label="Create a circle">＋ Circle</button></div></section>
    {route ? <div className="subpage-heading"><button onClick={() => navigate()} aria-label="Back to account views">←</button><h1>{routeTitle}</h1></div> : <nav className="reference-tabs" aria-label="Account views">{["circles", "following", "followers"].map((view) => <button key={view} className={`reference-tab ${tab === view ? "active" : ""}`} onClick={() => selectTab(view)}>{view[0].toUpperCase() + view.slice(1)}</button>)}</nav>}
    <div className="reference-tools"><label className="search-wrap"><span aria-hidden="true">⌕</span><input className="reference-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search username or display name" aria-label="Search username or display name" /></label><div className="sort-wrap"><button className="reference-sort" onClick={() => setSortOpen(!sortOpen)} aria-expanded={sortOpen} aria-haspopup="dialog">⇅ Sort</button>{sortOpen && <div className="sort-panel" role="dialog" aria-label="Sort by"><h3>Sort by</h3>{[{ id: "default", label: "Default" }, { id: "latest", label: "Date followed: Latest" }, { id: "earliest", label: "Date followed: Earliest" }].map((option) => <label key={option.id} className="sort-option"><input type="radio" name="sort" checked={sort === option.id} onChange={() => { setSort(option.id); setSortOpen(false); }} />{option.label}</label>)}</div>}</div></div>
    <div className="tab-slot">{tab === "circles" && !route ? <div className="filter-row">{circles.map((circle) => <button key={circle.id} className={`filter ${active.includes(circle.id) ? "selected" : ""}`} onClick={() => toggleCircle(circle.id)}>{circle.name}</button>)}</div> : <span aria-hidden="true" />}</div>
    {actionError && <p className="action-error" role="alert">{actionError}</p>}
    <div className="selection-bar"><label><input type="checkbox" checked={allShownSelected} ref={(input) => { if (input) input.indeterminate = someShownSelected; }} onChange={(event) => toggleAllShown(event.target.checked)} aria-label="Select all visible accounts" />Select all</label><span className="selection-count">{selected.size} selected</span></div>
    <div className="reference-list">{visibleRows.map((person) => renderRow(person, route === "suggestions"))}</div>
    {route === "suggestions" && <div ref={sentinelRef} className="suggestion-sentinel">{suggestionLoading ? "Loading more suggestions…" : suggestionRows.length >= suggestionTotal ? "You are up to date." : "Scroll for more"}</div>}
    {!route && <><section className="request-preview"><div className="section-heading"><h3>Follow requests</h3><button onClick={() => navigate("requests")}>See all</button></div>{pendingRequests.length ? <div className="request-cards"><div className="avatar-stack">{pendingRequests.slice(0, 3).map((person) => <PersonAvatar person={person} stacked key={person.id} />)}</div><p>{pendingRequests.length} private account request{pendingRequests.length === 1 ? "" : "s"}</p><button onClick={() => navigate("requests")}>Review</button></div> : <p className="empty-state">No pending follow requests.</p>}</section><section className="suggested-section"><div className="section-heading"><h3>Suggested users</h3><button onClick={() => navigate("suggestions")}>See all</button></div><div className="reference-list">{suggestedPreview.map((person) => renderRow(person, true))}</div></section></>}
  </div>{moreFor && <><div className="menu-scrim" aria-hidden="true" /><div className="more-menu floating-more-menu" role="menu" style={{ top: moreFor.top, right: moreFor.right }}><button role="menuitem" onClick={() => handleMore(moreFor.person, "favorite")}>{moreFor.person.favorite ? "Remove from favorites" : "Add to favorites"}</button>{moreFor.suggested && <button role="menuitem" onClick={() => handleMore(moreFor.person, "dismiss")}>Dismiss</button>}<button role="menuitem" onClick={() => handleMore(moreFor.person, "block")}>Block</button><button role="menuitem" className="menu-cancel" onClick={() => setMoreFor(null)}>Cancel</button></div></>}{sortOpen && !isInteractionLocked && <div className="sort-scrim" aria-hidden="true" />}{isDialogOpen && <div className="modal-scrim" aria-hidden="true" />}
  {circleEditor && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setCircleEditor(null)} aria-label="Close circle manager">×</button><p className="eyebrow">CIRCLE MANAGER</p><h2>{circleEditor.ids.length} selected {circleEditor.ids.length === 1 ? "person" : "people"}</h2>{circleEditor.error && <p id="capacity-error" className="capacity-error" role="alert">{circles.find((circle) => circle.id === circleEditor.error.id)?.name} has {circleEditor.error.current} / {CIRCLE_LIMIT} members. This change would make it {circleEditor.error.proposed} / {CIRCLE_LIMIT}; remove at least {circleEditor.error.needed} member{circleEditor.error.needed === 1 ? "" : "s"} before saving.</p>}{circles.map((circle) => { const states = circleEditor.ids.map((id) => circleEditor.draft[id].includes(circle.id)); const checked = states.every(Boolean); const mixed = states.some(Boolean) && !checked; return <label className={`manage-row ${circleEditor.error?.id === circle.id ? "capacity-invalid" : ""}`} key={circle.id}><span><input type="checkbox" checked={checked} ref={(input) => { if (input) input.indeterminate = mixed; }} onChange={(event) => toggleEditorCircle(circle.id, event.target.checked)} aria-describedby={circleEditor.error?.id === circle.id ? "capacity-error" : undefined} />{circle.name}</span><small>{memberCounts[circle.id] || 0} / {CIRCLE_LIMIT} members</small></label>; })}<div className="dialog-actions"><button className="secondary" onClick={() => setCircleEditor(null)}>Cancel</button><button className="primary" onClick={saveCircleEditor}>Save Changes</button></div></div></dialog>}
  {viewing && <dialog open className="modal notification-modal" aria-modal="true"><div className="modal-form" inert={notificationMoreOpen ? "" : undefined}><button className="close" onClick={() => { setNotificationMoreOpen(false); setViewing(null); }} aria-label="Close notifications">×</button><div className="notification-title"><div><p className="eyebrow">NOTIFICATIONS</p><h2>Notifications from {viewing.ids.length === 1 ? people.find((person) => person.id === viewing.ids[0])?.username : "profiles you follow"}</h2></div><div className="notification-more-wrap"><button className="more-button" onClick={() => setNotificationMoreOpen((open) => !open)} aria-label="More notification actions" aria-expanded={notificationMoreOpen} aria-haspopup="menu">⋮</button></div></div>{notificationTypes.map((type) => <button className="notification-row" key={type.id} onClick={() => setNotificationType(type.id)}><span className="notification-icon">{type.icon}</span><span><strong>{type.label}</strong><small>{notificationChoices.find((choice) => choice.id === viewing.preferences[type.id])?.label}</small></span><b>›</b></button>)}<button className="notification-row all-followed" onClick={() => openNotificationEditor(null, true)}><span className="notification-icon">☷</span><span><strong>All profiles you follow</strong></span><b>›</b></button><div className="dialog-actions"><button className="secondary" onClick={() => { setNotificationMoreOpen(false); setViewing(null); }}>Cancel</button><button className="primary" onClick={saveNotification}>Save Changes</button></div></div>{notificationMoreOpen && <div className="more-menu notification-more-menu notification-floating-menu" role="menu"><button role="menuitem" onClick={() => { setNotificationMoreOpen(false); setViewing(null); setRelationshipDialog({ ids: viewing.ids, kind: "block" }); }}>Block</button><button role="menuitem" className="menu-cancel" onClick={() => setNotificationMoreOpen(false)}>Cancel</button></div>}</dialog>}
  {notificationType && <dialog open className="modal choice-modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setNotificationType(null)} aria-label="Close notification choices">×</button><h2>{notificationTypes.find((type) => type.id === notificationType)?.label}</h2>{notificationChoices.map((choice) => <button className={`notification-choice ${viewing.preferences[notificationType] === choice.id ? "chosen" : ""}`} key={choice.id} onClick={() => chooseNotification(notificationType, choice.id)}><span>{choice.icon}</span>{choice.label}{viewing.preferences[notificationType] === choice.id && <b>✓</b>}</button>)}</div></dialog>}
  {relationshipDialog && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setRelationshipDialog(null)} aria-label="Close relationship confirmation">×</button><p className="eyebrow">RELATIONSHIP CHANGE</p><h2>{relationshipDialog.kind === "unfollow" ? "Unfollow" : relationshipDialog.kind === "block" ? "Block" : "Confirm"} {relationshipDialog.ids.length} {relationshipDialog.ids.length === 1 ? "person" : "people"}?</h2><p className="dialog-copy">{relationshipDialog.kind === "unfollow" ? "This updates your saved relationship list. It does not unfollow anyone on Instagram." : relationshipDialog.kind === "block" ? "Blocked accounts are removed from Following, Favorites, and private circles. You can restore them from the Blocked list." : "This accepts the private follow request in this prototype."}</p><div className="dialog-actions"><button className="secondary" onClick={() => setRelationshipDialog(null)}>Cancel</button><button className={`primary ${relationshipDialog.kind === "block" ? "danger" : ""}`} onClick={confirmRelationship}>{relationshipDialog.kind === "unfollow" ? "Unfollow" : relationshipDialog.kind === "block" ? "Block" : "Confirm"}</button></div></div></dialog>}
  {circleFormOpen && <dialog open className="modal" aria-modal="true"><form className="modal-form" onSubmit={submitCircle}><button type="button" className="close" onClick={() => setCircleFormOpen(false)} aria-label="Close circle form">×</button><p className="eyebrow">CIRCLE MANAGER</p><h2>Create a circle</h2>{circleFormError && <p id="circle-form-error" className="action-error" role="alert">{circleFormError}</p>}<label className="auth-field">Circle name<input autoFocus maxLength={40} value={circleName} onChange={(event) => { setCircleName(event.target.value); if (event.target.value.trim()) setCircleFormError(""); }} className={circleFormError === "Enter a circle name before creating it." ? "field-invalid" : undefined} aria-describedby={circleFormError ? "circle-form-error" : undefined} required /></label><div className="dialog-actions"><button type="button" className="secondary" onClick={() => setCircleFormOpen(false)}>Cancel</button>{circles.length > FREE_CIRCLE_LIMIT ? <button className="primary" type="button" onClick={openCircleLimitReview}>Review circles</button> : <button className="primary" type="submit">Create circle</button>}</div></form></dialog>}
  {circleLimitReview && <dialog open className="modal" aria-modal="true"><div className="modal-form"><button className="close" onClick={() => setCircleLimitReview(false)} aria-label="Close circle limit review">×</button><p className="eyebrow">CIRCLE LIMIT</p><h2>Choose {excessCircleCount} circle{excessCircleCount === 1 ? "" : "s"} to remove</h2><p className="dialog-copy">Free accounts can keep up to {FREE_CIRCLE_LIMIT} circles. Removing a circle also removes its private memberships; it does not unfollow anyone.</p>{circleLimitReviewError && <p className="action-error" role="alert">{circleLimitReviewError}</p>}<div className="circle-removal-list">{circles.map((circle) => <label className="manage-row" key={circle.id}><span><input type="checkbox" checked={circlesToRemove.has(circle.id)} onChange={(event) => { toggleCircleForRemoval(circle.id, event.target.checked); setCircleLimitReviewError(""); }} />{circle.name}</span><small>{memberCounts[circle.id] || 0} members</small></label>)}</div><p className="selection-count">{circlesToRemove.size} of {excessCircleCount} selected</p><div className="dialog-actions"><button className="secondary" onClick={() => setCircleLimitReview(false)}>Cancel</button><button className="primary danger" onClick={removeExcessCircles}>Remove selected circles</button></div></div></dialog>}
  </main>;
}
