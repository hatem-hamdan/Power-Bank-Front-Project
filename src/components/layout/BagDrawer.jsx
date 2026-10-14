import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { findVariant, formatMoney, unitPrice } from "../../data/catalog";

export function BagDrawer() {
  const navigate = useNavigate();
  const {
    bagOpen,
    setBagOpen,
    cart,
    changeLine,
    removeLine,
    currency,
    variants,
    productName,
    itemCount,
    shipping,
    amountDue,
  } = useStore();

  if (!bagOpen) {
    return null;
  }

  return (
    <div className="overlay">
      <button type="button" className="text-button" style={{ flex: 1 }} aria-label="Close bag" onClick={() => setBagOpen(false)} />
      <aside className="drawer">
        <button type="button" className="ghost compact" style={{ float: "right" }} onClick={() => setBagOpen(false)}>
          Close
        </button>
        <h3 style={{ margin: 0 }}>Your bag</h3>
        <div className="small">{itemCount} item(s)</div>
        {cart.length === 0 ? (
          <p className="muted">Your bag is empty. Pick a color, a capacity, and a quantity.</p>
        ) : (
          cart.map((line) => {
            const variant = findVariant(variants, line.color, line.capacity);
            const lineTotal = unitPrice(variant, currency) * line.quantity;

            return (
              <div className="bag-line" key={line.key}>
                <img src="/images/a.jpg" alt="" />
                <div className="grow">
                  <b>{productName}</b>
                  <div className="small">
                    {line.color} · {line.capacity}
                  </div>
                  <div className="quantity">
                    <button type="button" onClick={() => changeLine(line.key, -1)}>
                      −
                    </button>
                    <b>{line.quantity}</b>
                    <button type="button" onClick={() => changeLine(line.key, 1)}>
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <b>{formatMoney(lineTotal, currency)}</b>
                  <br />
                  <button type="button" className="text-button" onClick={() => removeLine(line.key)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
        {cart.length > 0 ? (
          <div className="total-row" style={{ fontWeight: 400, fontSize: 14 }}>
            <span className="small">Shipping</span>
            <b>{shipping ? formatMoney(shipping, currency) : "Free"}</b>
          </div>
        ) : null}
        <div className="total-row">
          <span>Total</span>
          <span>{formatMoney(cart.length ? amountDue : 0, currency)}</span>
        </div>
        <button
          type="button"
          className="primary full"
          disabled={cart.length === 0}
          onClick={() => {
            setBagOpen(false);
            navigate("/checkout");
          }}
        >
          Checkout
        </button>
      </aside>
    </div>
  );
}
