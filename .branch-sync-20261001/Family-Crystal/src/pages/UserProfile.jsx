import { useState } from "react";
import "./UserProfile.css";

function PlaceholderAvatar({ className = "" }) {
  return <span className={`user-profile-avatar ${className}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.8 20c.7-3.4 3.1-5.2 7.2-5.2s6.5 1.8 7.2 5.2" /></svg></span>;
}

function BackIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /><path d="M9 12h12" /></svg>;
}

export default function UserProfile({ profile, onBack }) {
  const [following, setFollowing] = useState(false);
  const [messageNotice, setMessageNotice] = useState("");
  const username = profile.username || "marko.was";
  const displayName = profile.name || "Marko Was";

  return <main className="visited-profile-page">
    <div className="visited-profile-shell">
      <header className="visited-profile-header">
        <button type="button" className="visited-profile-back" onClick={onBack} aria-label="Back to Family Circles"><BackIcon /></button>
        <h1>{username}</h1>
        <button type="button" className="visited-profile-icon-button" aria-label="More profile options">···</button>
      </header>

      <section className="visited-profile-summary" aria-label={`${displayName} profile`}>
        <PlaceholderAvatar className="visited-profile-main-avatar" />
        <div className="visited-profile-identity">
          <h2>{displayName}</h2>
          <div className="visited-profile-stats">
            <span><strong>{profile.posts || "250"}</strong> posts</span>
            <span><strong>{profile.followers || "683"}</strong> followers</span>
            <span><strong>{profile.followingCount || "1,062"}</strong> following</span>
          </div>
        </div>
      </section>

      <section className="visited-profile-bio">
        <p>{profile.bio || "Fashion. AI models. Infinite looks."}</p>
        <div className="visited-profile-mutuals">
          <span className="visited-profile-mutual-avatars" aria-hidden="true"><PlaceholderAvatar /><PlaceholderAvatar /><PlaceholderAvatar /></span>
          <span>Followed by user1, user2 and others</span>
        </div>
      </section>

      <div className="visited-profile-actions">
        <button type="button" className={following ? "visited-profile-follow is-following" : "visited-profile-follow"} onClick={() => setFollowing((value) => !value)}>{following ? "Following" : "Follow"}</button>
        <button type="button" className="visited-profile-message" onClick={() => setMessageNotice("Messaging is a prototype; no message was sent.")}>Message</button>
      </div>
      {messageNotice && <p className="visited-profile-notice" role="status">{messageNotice}</p>}

      <nav className="visited-profile-tabs" aria-label="Profile content"><button type="button" className="selected" aria-current="page">Posts</button><button type="button" disabled>Reels</button><button type="button" disabled>Tagged</button></nav>
      <section className="visited-profile-empty" aria-label="Posts"><div aria-hidden="true">▦</div><p>No posts are available in this prototype.</p></section>
    </div>
  </main>;
}
