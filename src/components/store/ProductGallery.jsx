import { CLIPS, NO_VIDEO, galleryFor } from "../../data/catalog";

export function ProductGallery({ color, capacity }) {
  const { shots, note } = galleryFor(color, capacity);
  const clip = CLIPS[`${color}|${capacity}`] || "";
  const columns = Math.min(shots.length, 3);

  return (
    <div>
      <div className="gallery" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {clip ? (
          <video className="clip" controls playsInline preload="metadata" src={clip} />
        ) : (
          <div className="no-video">{NO_VIDEO}</div>
        )}
        {shots.map((src) => (
          <img className="photo" key={src} src={src} alt={`${color} ${capacity} keychain power bank`} />
        ))}
      </div>
      {note ? <p className="small">{note}</p> : null}
    </div>
  );
}
