import { useEffect, useRef, useState } from "react";
import VideoScrubPreview from "./VideoScrubPreview.jsx";
import VideoTimeSlider from "./VideoTimeSlider.jsx";
import "./ProfileMediaGrid.css";

const PAGE_SIZE = 50;

const MEDIA_TABS = [
  { id: "posts", label: "Posts", icon: "posts" },
  { id: "reels", label: "Reels", icon: "reels" },
  { id: "reposts", label: "Repost", icon: "repost" },
  { id: "tagged", label: "Photos and videos of you", icon: "tagged" },
];

function MediaTabIcon({ name }) {
  if (name === "reels") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><path d="m10 8 6 4-6 4z" /></svg>;
  if (name === "repost") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-2.5-2.5M17 17H6l2.5 2.5M18 7l2 2v4M6 17l-2-2v-4" /></svg>;
  if (name === "tagged") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="12" cy="10" r="2.5" /><path d="M7.5 18c.7-2.1 2.2-3.2 4.5-3.2s3.8 1.1 4.5 3.2" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="5" height="5" /><rect x="9.5" y="3" width="5" height="5" /><rect x="16" y="3" width="5" height="5" /><rect x="3" y="9.5" width="5" height="5" /><rect x="9.5" y="9.5" width="5" height="5" /><rect x="16" y="9.5" width="5" height="5" /><rect x="3" y="16" width="5" height="5" /><rect x="9.5" y="16" width="5" height="5" /><rect x="16" y="16" width="5" height="5" /></svg>;
}

function isVideo(item) {
  return item.type === "video" || /\.(mp4|webm|mov)(?:$|\?)/i.test(item.src || "");
}

function ProfileVideo({ item, label }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const previewSrc = /^\/assets\/reel-(0[1-9]|10)\.mp4$/.test(item.src || "") ? item.src : null;

  const seek = (nextPosition) => {
    const video = videoRef.current;
    if (!video || unavailable) return;
    video.currentTime = nextPosition;
    setPosition(nextPosition);
  };

  return <div className="profile-media-video">
    <video
      ref={videoRef}
      src={item.src}
      controls
      playsInline
      preload="metadata"
      aria-label={label}
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      onDurationChange={(event) => setDuration(event.currentTarget.duration)}
      onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
      onSeeked={(event) => setPosition(event.currentTarget.currentTime)}
      onError={() => { setUnavailable(true); setScrubbing(false); }}
    />
    {unavailable && <p className="profile-media-video-error" role="status">Video unavailable. Other profile media remains accessible.</p>}
    <VideoScrubPreview src={previewSrc} time={position} duration={duration} active={scrubbing && !unavailable} />
    <VideoTimeSlider duration={duration} position={position} onSeek={seek} onScrubbingChange={setScrubbing} label={label} unavailable={unavailable} />
  </div>;
}

function MediaTile({ item, tabLabel }) {
  const label = item.title || `${tabLabel} item`;
  return <article className={`profile-media-tile${isVideo(item) ? " profile-media-tile-video" : ""}`}>
    {isVideo(item)
      ? <ProfileVideo key={item.src} item={item} label={label} />
      : item.src
        ? <img src={item.src} alt={label} loading="lazy" />
        : <div className="profile-media-tile-placeholder" role="img" aria-label={label}>{label}</div>}
  </article>;
}

export default function ProfileMediaGrid({ id, items = {}, emptyMessages = {} }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);
  const activeTabInfo = MEDIA_TABS.find((tab) => tab.id === activeTab);
  const entries = Array.isArray(items[activeTab]) ? items[activeTab] : [];
  const visibleEntries = entries.slice(0, visibleCount);
  const panelId = `${id || "profile"}-media-panel`;

  const handleTabKeyDown = (event) => {
    const currentIndex = MEDIA_TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % MEDIA_TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + MEDIA_TABS.length) % MEDIA_TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = MEDIA_TABS.length - 1;
    else return;

    event.preventDefault();
    const tabButtons = event.currentTarget.parentElement.querySelectorAll('[role="tab"]');
    setActiveTab(MEDIA_TABS[nextIndex].id);
    tabButtons[nextIndex]?.focus();
  };

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  useEffect(() => {
    if (visibleCount >= entries.length || !sentinelRef.current || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((count) => Math.min(count + PAGE_SIZE, entries.length));
    }, { rootMargin: "320px 0px" });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [activeTab, entries.length, visibleCount]);

  const loadMore = () => setVisibleCount((count) => Math.min(count + PAGE_SIZE, entries.length));

  return <section id={id} className="profile-media" aria-label="Profile media">
    <nav className="profile-media-tabs" role="tablist" aria-label="Profile media categories">
      {MEDIA_TABS.map((tab) => <button
        key={tab.id}
        id={`${id || "profile"}-tab-${tab.id}`}
        type="button"
        className={`profile-media-tab ${activeTab === tab.id ? "selected" : ""}`}
        role="tab"
        aria-label={tab.label}
        aria-selected={activeTab === tab.id}
        tabIndex={activeTab === tab.id ? 0 : -1}
        aria-controls={panelId}
        onKeyDown={handleTabKeyDown}
        onClick={() => setActiveTab(tab.id)}
      ><MediaTabIcon name={tab.icon} /></button>)}
    </nav>
    <div id={panelId} className="profile-media-panel" role="tabpanel" aria-labelledby={`${id || "profile"}-tab-${activeTab}`}>
      {entries.length === 0
        ? <p className="profile-media-empty" role="status">{emptyMessages[activeTab] || `No ${activeTabInfo.label.toLowerCase()} are available in this preview.`}</p>
        : <>
          <div className="profile-media-grid">
            {visibleEntries.map((item, index) => <MediaTile key={item.id || `${activeTab}-${index}`} item={item} tabLabel={activeTabInfo.label} />)}
          </div>
          {visibleCount < entries.length && <div ref={sentinelRef} className="profile-media-more">
            <span aria-hidden="true">Loading more…</span>
            <button type="button" onClick={loadMore}>Load more</button>
          </div>}
        </>}
    </div>
  </section>;
}
