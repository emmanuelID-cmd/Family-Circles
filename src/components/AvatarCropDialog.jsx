import { useEffect, useMemo, useState } from "react";
import { createAvatarDataUrl, getAvatarCropBounds, validateAvatarDimensions } from "../lib/avatarImage.js";

export default function AvatarCropDialog({ file, onCancel, onSave }) {
  const [image, setImage] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);

  useEffect(() => {
    if (!file) return undefined;
    setImage(null);
    setLoadError("");
    setSaveError("");
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
    let active = true;
    const objectUrl = URL.createObjectURL(file);
    const preview = new Image();
    preview.onload = () => {
      if (!active) return;
      const dimensionError = validateAvatarDimensions(preview.naturalWidth, preview.naturalHeight);
      if (dimensionError) {
        setLoadError(dimensionError);
        return;
      }
      setImage({ element: preview, width: preview.naturalWidth, height: preview.naturalHeight });
    };
    preview.onerror = () => {
      if (active) setLoadError("This image could not be opened. Try a JPEG, PNG, or WebP image.");
    };
    preview.src = objectUrl;
    return () => {
      active = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, saving]);

  const bounds = useMemo(() => image ? getAvatarCropBounds(image.width, image.height, zoom, positionX, positionY) : null, [image, zoom, positionX, positionY]);
  const previewStyle = bounds ? {
    width: `${image.width / bounds.size * 100}%`,
    height: `${image.height / bounds.size * 100}%`,
    left: `${-bounds.x / bounds.size * 100}%`,
    top: `${-bounds.y / bounds.size * 100}%`,
  } : undefined;

  const save = async (event) => {
    event.preventDefault();
    if (!image || !bounds || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave(createAvatarDataUrl(image.element, bounds));
    } catch (error) {
      setSaveError(error.message || "Could not save this avatar. Try again.");
      setSaving(false);
    }
  };

  return <dialog open className="modal avatar-crop-modal" aria-modal="true" aria-labelledby="avatar-crop-title">
    <form className="modal-form" onSubmit={save}>
      <button type="button" className="close" onClick={onCancel} aria-label="Close avatar crop" disabled={saving} autoFocus>×</button>
      <p className="eyebrow">PROFILE PHOTO</p>
      <h2 id="avatar-crop-title">Crop your avatar</h2>
      <p className="dialog-copy">Adjust the square crop. Your image is resized before it is saved to this profile.</p>
      {loadError ? <p className="action-error" role="alert">{loadError}</p> : image ? <>
        <div className="avatar-crop-preview" aria-label="Avatar crop preview"><img className="avatar-crop-preview-image" src={image.element.src} alt="" style={previewStyle} /></div>
        <label className="avatar-crop-control">Zoom
          <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} disabled={saving} />
        </label>
        <label className="avatar-crop-control">Horizontal position
          <input type="range" min="0" max="100" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} disabled={saving || image.width <= bounds.size} />
        </label>
        <label className="avatar-crop-control">Vertical position
          <input type="range" min="0" max="100" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} disabled={saving || image.height <= bounds.size} />
        </label>
      </> : <p className="dialog-copy" role="status">Preparing image…</p>}
      {saveError && <p className="action-error" role="alert">{saveError}</p>}
      <div className="dialog-actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="primary" disabled={!image || Boolean(loadError) || saving}>{saving ? "Saving…" : "Save avatar"}</button>
      </div>
    </form>
  </dialog>;
}
