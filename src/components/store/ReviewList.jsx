import { useMemo, useState } from "react";
import { REVIEW_START, REVIEW_STEP, REVIEW_TOTAL, buildReviews } from "../../data/reviews";

export function ReviewList() {
  const reviews = useMemo(() => buildReviews(), []);
  const [shown, setShown] = useState(REVIEW_START);
  const visible = reviews.slice(0, shown);

  function showMore() {
    setShown((current) => Math.min(REVIEW_TOTAL, current + REVIEW_STEP));
  }

  return (
    <section id="reviews">
      <h2 className="section-title">What customers say</h2>
      <p className="section-copy">Notes from people who keep one on their keys.</p>
      <div className="reviews">
        {visible.map((review) => (
          <article className="card review-card" key={`${review.name}-${review.text}`}>
            <div className="stars">{review.stars === 5 ? "★★★★★" : "★★★★☆"}</div>
            <p>{review.text}</p>
            <p className="review-tag">
              {review.color} · {review.capacity}
            </p>
            <div className="reviewer">
              <span className="avatar">{review.letter}</span>
              <small>{review.name}</small>
            </div>
          </article>
        ))}
      </div>
      {shown < REVIEW_TOTAL ? (
        <button type="button" className="more-reviews" onClick={showMore} aria-label="Show 5 more reviews">
          ↓
        </button>
      ) : null}
      <p className="section-copy">
        {shown} of {REVIEW_TOTAL}
      </p>
    </section>
  );
}
