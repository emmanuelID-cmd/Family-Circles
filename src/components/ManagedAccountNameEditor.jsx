import { useEffect, useMemo, useRef, useState } from "react";
import {
  getNameChangeExpiry,
  isNameChangeExpired,
  normalizeManagedAccountNames,
  planManagedAccountNameChange,
} from "../lib/nameChange.js";
import { updateManagedAccountNames } from "../lib/familyData.js";

function formatDate(date) {
  return date?.toLocaleDateString(undefined, { dateStyle: "long" }) || "";
}

export default function ManagedAccountNameEditor({ accountId, profile, returnFocusRef, onClose, onSaved }) {
  const firstFieldRef = useRef(null);
  const busyRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const [draft, setDraft] = useState({
    displayName: profile?.display_name || "",
    username: profile?.username || "",
  });
  const [busy, setBusy] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      returnFocusRef?.current?.focus();
    };
  }, [returnFocusRef]);

  const plan = useMemo(() => {
    try {
      return { value: planManagedAccountNameChange({ current: profile, next: draft }), error: "" };
    } catch (planError) {
      return { value: null, error: planError.message || "Check the name fields and try again." };
    }
  }, [draft, profile]);
  const expiry = getNameChangeExpiry(profile?.name_changed_at);
  const cooldownActive = Boolean(expiry && !isNameChangeExpired(profile?.name_changed_at));
  const fieldErrors = useMemo(() => {
    const errors = {};
    try {
      normalizeManagedAccountNames({ username: "valid.username", displayName: draft.displayName });
    } catch (validation) {
      errors.displayName = validation.message || "Check the display name and try again.";
    }
    try {
      normalizeManagedAccountNames({ username: draft.username, displayName: "Valid Display Name" });
    } catch (validation) {
      errors.username = validation.message || "Check the username and try again.";
    }
    return errors;
  }, [draft]);
  const validationErrors = showValidation ? fieldErrors : {};
  const validationSummary = Object.entries(validationErrors)
    .map(([field, message]) => `${field === "displayName" ? "Display name" : "Username"}: ${message}`)
    .join(" ") || plan.error;
  const validationError = showValidation ? validationSummary : "";
  const displayNameErrorId = validationErrors.displayName ? "managed-display-name-error" : undefined;
  const usernameErrorId = validationErrors.username ? "managed-username-error" : undefined;

  const updateDraft = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
    setError("");
    setStatus("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setShowValidation(true);
    setError("");
    setStatus("");
    if (!plan.value) return;
    if (plan.value.status === "noop") {
      setStatus("No changes to save.");
      return;
    }

    setBusy(true);
    try {
      const updated = await updateManagedAccountNames(accountId, draft);
      await onSaved?.(updated);
      onClose();
    } catch (saveError) {
      setError(saveError.message || "Could not save these names. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const blocked = plan.value?.status === "blocked";
  const guidance = blocked
    ? `You can change either name again after ${formatDate(plan.value.nextEligibleAt)}.`
    : cooldownActive
      ? `A name change is active. You can change either name again after ${formatDate(expiry)}.`
      : plan.value?.status === "change"
        ? `Changing either field starts one shared 30-day cooldown for both fields. If you save, the next eligible date is ${formatDate(plan.value.nextEligibleAt)}.`
        : "Name changes are available now. Changing either field starts one shared 30-day cooldown for both fields.";

  return <dialog open className="modal" aria-modal="true" aria-labelledby="managed-name-title" aria-describedby="managed-name-guidance">
    <form className="modal-form" onSubmit={submit}>
      <button type="button" className="close" onClick={onClose} aria-label="Close name editor" disabled={busy}>×</button>
      <p className="eyebrow">PROFILE</p>
      <h2 id="managed-name-title">Edit names</h2>
      <p id="managed-name-guidance" className="dialog-copy">{guidance}</p>
      {validationError && <p id="managed-name-validation-summary" className="action-error" role="alert">{validationError}</p>}
      {error && <p className="action-error" role="alert">{error}</p>}
      {status && <p className="auth-message" role="status">{status}</p>}
      <label className="auth-field">Display name
        <input
          ref={firstFieldRef}
          autoComplete="name"
          maxLength={80}
          value={draft.displayName}
          onChange={updateDraft("displayName")}
          aria-describedby={["managed-name-guidance", displayNameErrorId].filter(Boolean).join(" ")}
          aria-invalid={Boolean(validationErrors.displayName)}
          className={validationErrors.displayName ? "field-invalid" : undefined}
          disabled={busy}
        />
      </label>
      {validationErrors.displayName && <small id={displayNameErrorId} className="field-error" role="alert">{validationErrors.displayName}</small>}
      {profile?.temp_screen_name && <small className="field-help">Previous display name: <del>{profile.temp_screen_name}</del></small>}
      <label className="auth-field">Username
        <input
          autoComplete="username"
          maxLength={30}
          pattern="[A-Za-z0-9._]{1,30}"
          value={draft.username}
          onChange={updateDraft("username")}
          aria-describedby={["managed-name-guidance", usernameErrorId].filter(Boolean).join(" ")}
          aria-invalid={Boolean(validationErrors.username)}
          className={validationErrors.username ? "field-invalid" : undefined}
          disabled={busy}
        />
      </label>
      {validationErrors.username && <small id={usernameErrorId} className="field-error" role="alert">{validationErrors.username}</small>}
      {profile?.temp_user_name && <small className="field-help">Previous username: <del>{profile.temp_user_name}</del></small>}
      <div className="dialog-actions">
        <button type="button" className="secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="submit" className="primary" disabled={busy || blocked}>{busy ? "Saving…" : blocked ? "Change unavailable" : "Save Changes"}</button>
      </div>
    </form>
  </dialog>;
}
