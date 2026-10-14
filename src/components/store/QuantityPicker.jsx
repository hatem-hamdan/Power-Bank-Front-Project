export function QuantityPicker({ quantity, onChange }) {
  return (
    <div>
      <div className="field-label">Quantity</div>
      <div className="quantity">
        <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
          −
        </button>
        <b>{quantity}</b>
        <button type="button" onClick={() => onChange(Math.min(10, quantity + 1))} aria-label="Increase quantity">
          +
        </button>
      </div>
    </div>
  );
}
