import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { PayPalSlot } from "../components/checkout/PayPalSlot";
import { useStore } from "../context/StoreContext";
import { findVariant, formatMoney, unitPrice } from "../data/catalog";
import { US_STATES } from "../data/states";

export function CheckoutPage() {
  const { cart, currency, setCurrency, session, variants, shipping, amountDue } = useStore();
  const [country, setCountry] = useState(currency === "GBP" ? "United Kingdom" : "United States");
  const [error, setError] = useState("");

  if (cart.length === 0) {
    return <Navigate to="/product" replace />;
  }

  function readForm() {
    const form = document.getElementById("checkout-form");
    const data = new FormData(form);
    const selectedCountry = String(data.get("country") || country);

    return {
      fullName: String(data.get("fullName") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      confirmPhone: String(data.get("confirmPhone") || "").trim(),
      region: String(data.get("region") || "").trim(),
      addressLine: String(data.get("addressLine") || "").trim(),
      city: String(data.get("city") || "").trim(),
      postalCode: String(data.get("postalCode") || "").trim(),
      country: selectedCountry,
      currency: selectedCountry === "United Kingdom" ? "GBP" : "USD",
      items: cart.map((line) => ({
        variantID: findVariant(variants, line.color, line.capacity)?.variantID || line.variantId,
        quantity: line.quantity,
      })),
    };
  }

  function validate() {
    const order = readForm();
    const postalLabel = order.country === "United Kingdom" ? "postcode" : "ZIP code";

    if (!order.fullName || !order.addressLine || !order.city || !order.postalCode) {
      setError(`Please enter your name, address, city, and ${postalLabel}.`);
      return errorText();
    }

    if (!order.phone || order.phone !== order.confirmPhone) {
      setError("Enter the same phone number twice.");
      return errorText();
    }

    if (order.country === "United States" && !order.region) {
      setError("Choose a state.");
      return errorText();
    }

    if (order.items.some((item) => !item.variantID)) {
      setError("One of the items in your bag is not available.");
      return errorText();
    }

    setError("");
    return "";
  }

  function orderBody() {
    const order = readForm();
    return {
      fullName: order.fullName,
      phone: order.phone,
      region: order.region,
      addressLine: order.addressLine,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
      currency: order.currency,
      items: order.items,
    };
  }

  function onCountry(next) {
    setCountry(next);
    setCurrency(next === "United Kingdom" ? "GBP" : "USD");
  }

  const postalLabel = country === "United Kingdom" ? "Postcode" : "ZIP code";

  return (
    <>
      <Link className="text-button" to="/product">
        ← Back to bag
      </Link>
      <h2 className="page-heading">Checkout</h2>
      <p className="muted">Shipping details, then pay with PayPal.</p>
      <div className="checkout-layout">
        <div>
          {cart.map((line) => {
            const variant = findVariant(variants, line.color, line.capacity);

            return (
              <div className="bag-line" key={line.key}>
                <div className="grow">
                  <b>
                    {line.color} · {line.capacity}
                  </b>
                  <div className="small">Qty {line.quantity}</div>
                </div>
                <b>{formatMoney(unitPrice(variant, currency) * line.quantity, currency)}</b>
              </div>
            );
          })}
          <div className="total-row" style={{ fontWeight: 400, fontSize: 14 }}>
            <span className="small">Shipping</span>
            <b>{shipping ? formatMoney(shipping, currency) : "Free"}</b>
          </div>
          <div className="total-row">
            <span>Total</span>
            <span>{formatMoney(amountDue, currency)}</span>
          </div>
        </div>
        <form id="checkout-form" onSubmit={(event) => event.preventDefault()}>
          <div className="form-grid">
            <div className="stack-field">
              <label className="field-label" htmlFor="fullName">
                Full name
              </label>
              <input id="fullName" name="fullName" placeholder="Full name" defaultValue={session?.name || ""} />
            </div>
            <div className="stack-field">
              <label className="field-label" htmlFor="phone">
                Phone number
              </label>
              <input id="phone" name="phone" placeholder="Phone number" />
            </div>
          </div>
          <div className="form-grid">
            <div className="stack-field">
              <label className="field-label" htmlFor="confirmPhone">
                Confirm phone number
              </label>
              <input id="confirmPhone" name="confirmPhone" placeholder="Same number again" />
            </div>
            <div className="stack-field">
              <label className="field-label" htmlFor="country">
                Country
              </label>
              <select id="country" name="country" value={country} onChange={(event) => onCountry(event.target.value)}>
                <option>United States</option>
                <option>United Kingdom</option>
              </select>
            </div>
          </div>
          <div className="stack-field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" value={session?.email || ""} placeholder="Sign in to fill your email" readOnly />
          </div>
          <div className="form-grid">
            <div className="stack-field">
              <label className="field-label" htmlFor="city">
                City
              </label>
              <input id="city" name="city" placeholder="City" />
            </div>
            {country === "United States" ? (
              <div className="stack-field">
                <label className="field-label" htmlFor="region">
                  State
                </label>
                <select id="region" name="region" defaultValue="">
                  <option value="">Select a state</option>
                  {US_STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
          <div className="stack-field">
            <label className="field-label" htmlFor="addressLine">
              Address
            </label>
            <input id="addressLine" name="addressLine" placeholder="Street address" />
          </div>
          <div className="stack-field">
            <label className="field-label" htmlFor="postalCode">
              {postalLabel}
            </label>
            <input id="postalCode" name="postalCode" placeholder={postalLabel} />
          </div>
          <p id="checkout-error" className="form-error">
            {error}
          </p>
          <PayPalSlot orderBody={orderBody} validate={validate} />
          <p className="small" style={{ textAlign: "center" }}>
            One item ships for {formatMoney(currency === "GBP" ? 5.5 : 7, currency)}. Two or more ship free.
          </p>
        </form>
      </div>
    </>
  );
}

function errorText() {
  return "invalid";
}
