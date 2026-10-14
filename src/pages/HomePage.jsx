import { Link } from "react-router-dom";
import { SocialProof } from "../components/store/SocialProof";
import { ReviewList } from "../components/store/ReviewList";
import { useStore } from "../context/StoreContext";
import { GALLERY_IMAGES, HERO_IMAGE, LIFESTYLE_IMAGE, formatMoney, unitPrice } from "../data/catalog";

const FEATURES = [
  ["🔌", "Cables built in", "Lightning and USB-C cables tuck into the body. Nothing extra to carry."],
  ["🔑", "Clips anywhere", "The keyring loop fits your keys, backpack, or gym bag."],
  ["🤏", "Tiny by design", "Pocket-sized, so it goes wherever your keys go."],
  ["🔦", "Built-in light", "An LED flashlight on the front edge for dark moments."],
];

const SPECS = [
  ["Capacity", "2000 mAh or 4000 mAh"],
  ["Connectors", "Built-in Lightning + USB-C"],
  ["Colors", "Black, White"],
  ["Attachment", "Keyring loop"],
  ["Light", "LED flashlight"],
  ["Size", "Pocket-sized"],
];

export function HomePage() {
  const { variants, currency, productName } = useStore();
  const fromPrice = Math.min(...variants.map((variant) => unitPrice(variant, currency)));

  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">POCKET POWER</div>
          <h1>Power that clips to your keys.</h1>
          <p>
            A tiny power bank with Lightning and USB-C cables built in. Hang it on your keychain or bag and never run out at the wrong time.
          </p>
          <SocialProof />
          <div className="inline-row">
            <Link className="primary" to="/product">
              Shop now
            </Link>
            <Link className="ghost" to="/#features">
              See features
            </Link>
          </div>
          <div className="small" style={{ marginTop: 14 }}>
            Lightning + USB-C built in · 2000 & 4000 mAh · Black or White
          </div>
        </div>
        <img className="photo" src={HERO_IMAGE} alt="Keychain power bank" />
      </section>

      <div className="strip">
        <div>
          <b>2 sizes</b>
          2000 & 4000 mAh
        </div>
        <div>
          <b>Lightning + USB-C</b>
          Cables built in
        </div>
        <div>
          <b>Keychain ring</b>
          Clips to keys & bags
        </div>
        <div>
          <b>LED light</b>
          Built-in flashlight
        </div>
      </div>

      <h2 className="section-title" id="features">
        Small enough to forget. Handy when it counts.
      </h2>
      <p className="section-copy">Everything you need to top up your phone, on your keys.</p>
      <div className="features">
        {FEATURES.map(([icon, title, copy]) => (
          <article className="card feature" key={title}>
            <span>{icon}</span>
            <b>{title}</b>
            <p>{copy}</p>
          </article>
        ))}
      </div>

      <div className="life">
        <img className="photo" src={LIFESTYLE_IMAGE} alt="Charging two phones" />
        <div>
          <div className="eyebrow">ONE POWER BANK · BOTH PORTS</div>
          <h3>Charges iPhone and Android</h3>
          <p>Lightning for iPhone, USB-C for Android and other USB-C devices. Pull out the cable you need and plug in.</p>
          <div className="ports">
            <span>Lightning</span>
            <span>USB-C</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">See it from every angle</h2>
      <p className="section-copy">Matte finish, compact shape, built-in cables.</p>
      <div className="angles">
        {GALLERY_IMAGES.map((src) => (
          <img className="photo" key={src} src={src} alt="Keychain power bank" />
        ))}
      </div>

      <h2 className="section-title">Pick yours</h2>
      <div className="pick-card">
        <img className="photo" src={HERO_IMAGE} alt="Keychain power bank" />
        <b style={{ display: "block", margin: "12px 0 2px", fontSize: 19 }}>{productName}</b>
        <SocialProof centered />
        <div className="small">Black or White · 2000 or 4000 mAh</div>
        <div className="price" style={{ margin: "6px 0 14px" }}>
          From {formatMoney(fromPrice, currency)}
        </div>
        <Link className="primary full" to="/product">
          View product
        </Link>
      </div>

      <h2 className="section-title" id="specs">
        Specs
      </h2>
      <div className="specs">
        {SPECS.map(([label, value]) => (
          <div className="spec-row" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>

      <ReviewList />

      <h2 className="section-title" id="faq">
        FAQ
      </h2>
      <details className="faq-item">
        <summary>Which phones does it work with?</summary>
        <p>Lightning cable for iPhone, USB-C cable for Android and other USB-C devices.</p>
      </details>
      <details className="faq-item">
        <summary>Which capacity should I pick?</summary>
        <p>2000 mAh is the lightest option for everyday carry. 4000 mAh holds more charge for longer days.</p>
      </details>
      <details className="faq-item">
        <summary>Do you ship to the US and the UK?</summary>
        <p>Yes. One item ships for $7 or £5.50. Two or more ship free.</p>
      </details>
    </>
  );
}
