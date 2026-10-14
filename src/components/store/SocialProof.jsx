import { Link } from "react-router-dom";

export function SocialProof({ centered = false }) {
  return (
    <div className="proof" style={centered ? { justifyContent: "center" } : undefined}>
      <Link to="/#reviews">
        <span className="stars">★★★★★</span>
        4.8 <span className="small">214 reviews</span>
      </Link>
      <span className="hot">🔥 1,842 bought</span>
    </div>
  );
}
