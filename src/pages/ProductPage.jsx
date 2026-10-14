import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OptionGroup } from "../components/store/OptionGroup";
import { ProductGallery } from "../components/store/ProductGallery";
import { QuantityPicker } from "../components/store/QuantityPicker";
import { SocialProof } from "../components/store/SocialProof";
import { useStore } from "../context/StoreContext";
import { findVariant, formatMoney, unitPrice } from "../data/catalog";

export function ProductPage() {
  const { variants, productName, productDescription, currency, addToBag } = useStore();
  const colors = useMemo(() => unique(variants.map((variant) => variant.color)), [variants]);
  const capacities = useMemo(
    () => unique(variants.map((variant) => variant.capacity)).sort().reverse(),
    [variants]
  );
  const [color, setColor] = useState(colors[0] || "Black");
  const [capacity, setCapacity] = useState(capacities[0] || "4000 mAh");
  const [quantity, setQuantity] = useState(1);
  const variant = findVariant(variants, color, capacity);
  const price = unitPrice(variant, currency);

  return (
    <>
      <Link className="text-button" to="/">
        ← Back to store
      </Link>
      <div className="product-layout">
        <ProductGallery color={color} capacity={capacity} />
        <div className="product-copy">
          <h1 style={{ margin: 0, fontSize: 32 }}>{productName}</h1>
          <SocialProof />
          <div className="price" style={{ margin: "8px 0" }}>
            {formatMoney(price, currency)}
          </div>
          <p className="muted">{productDescription}</p>
          <OptionGroup label="Color" value={color} options={colors} onChange={setColor} />
          <OptionGroup label="Capacity" value={capacity} options={capacities} onChange={setCapacity} />
          <QuantityPicker quantity={quantity} onChange={setQuantity} />
          <button type="button" className="primary full" onClick={() => addToBag(color, capacity, quantity)}>
            Add to bag · {formatMoney(price * quantity, currency)}
          </button>
          <p className="small" style={{ textAlign: "center" }}>
            Choose color, capacity, and quantity. Review them in your bag before checkout.
          </p>
        </div>
      </div>
    </>
  );
}

function unique(values) {
  return [...new Set(values)];
}
