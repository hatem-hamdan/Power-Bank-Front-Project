import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { errorMessage } from "../api/client";
import { getOrder, requestReturn } from "../api/orderApi";
import { formatMoney } from "../data/catalog";

const STEPS = ["Placed", "Preparing", "Shipped", "Delivered"];

export function OrderPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [message, setMessage] = useState("");
  const [returnError, setReturnError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;

    getOrder(orderNumber)
      .then((response) => {
        if (active) {
          setOrder(response.data);
        }
      })
      .catch((error) => {
        if (active && !order) {
          setMessage(errorMessage(error, "Open it again from your orders."));
        }
      });

    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (!order && !message) {
    return <p className="muted">Loading…</p>;
  }

  if (!order) {
    return (
      <section className="receipt">
        <Link className="text-button" to="/">
          ← Back to store
        </Link>
        <h2>Could not open this order</h2>
        <p className="muted">{message}</p>
      </section>
    );
  }

  const stepIndex = Math.max(0, STEPS.indexOf(order.status));
  const open = returnWindowOpen(order.createdAt);

  async function sendReturn(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reason = String(form.get("reason") || "").trim();
    const items = order.items
      .map((item) => ({
        orderItemID: item.orderItemID,
        quantity: Number(form.get(`qty-${item.orderItemID}`) || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (reason.length < 5) {
      setReturnError("Tell us why you are returning this, in a few words.");
      return;
    }

    if (items.length === 0) {
      setReturnError("Choose how many of each item to return.");
      return;
    }

    setSending(true);
    setReturnError("Sending your return…");

    try {
      const response = await requestReturn(order.orderNumber, { reason, items });
      setOrder(response.data);
      setReturnError("");
    } catch (error) {
      setReturnError(errorMessage(error, "Could not start this return."));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="receipt">
      <Link className="text-button" to="/">
        ← Back to store
      </Link>
      <div className="eyebrow">ORDER {order.orderNumber}</div>
      <h2 className="page-heading">Track your order</h2>
      <p className="muted">
        {formatWhen(order.createdAt)} · {formatMoney(order.total, order.currency)}
      </p>
      <div className="track">
        {STEPS.map((label, index) => (
          <div className={index <= stepIndex ? "step done" : "step"} key={label}>
            <div className="rail">
              <div className="step-dot" />
              {index < STEPS.length - 1 ? <div className="step-line" /> : null}
            </div>
            <div>
              <b>{stepCopy(label, order)[0]}</b>
              <div className="small">{stepCopy(label, order)[1]}</div>
            </div>
          </div>
        ))}
      </div>
      <h3>Items</h3>
      {order.items.map((item) => (
        <div className="bag-line" key={item.orderItemID}>
          <div className="grow">
            <b>
              {item.color} · {item.capacity}
            </b>
            <div className="small">Qty {item.quantity}</div>
          </div>
          <b>{formatMoney(item.lineTotal, order.currency)}</b>
        </div>
      ))}
      <p className="small">
        Ships to {order.fullName}, {order.addressLine}, {order.city}
        {order.region ? ` ${order.region}` : ""} {order.postalCode}, {order.country}
      </p>
      <div className="total-row" style={{ fontWeight: 400, fontSize: 14 }}>
        <span className="small">Shipping</span>
        <b>{Number(order.shippingAmount) ? formatMoney(order.shippingAmount, order.currency) : "Free"}</b>
      </div>
      <div className="total-row">
        <span>Total</span>
        <span>{formatMoney(order.total, order.currency)}</span>
      </div>
      {order.returns?.length ? (
        <div className="return-box">
          <h3>Returns</h3>
          <div className="orders">
            {order.returns.map((row) => (
              <div className="order-card" key={row.returnNumber}>
                <b>{row.returnNumber}</b>
                <div className="small">
                  {row.status} · {formatMoney(row.amount, order.currency)} · {formatWhen(row.createdAt)}
                </div>
                {row.items.map((item) => (
                  <div key={`${row.returnNumber}-${item.orderItemID}`}>
                    {item.color} · {item.capacity} × {item.quantity}
                  </div>
                ))}
                <div className="small">{row.reason}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {open ? (
        <form className="return-box" onSubmit={sendReturn}>
          <h3>Return items</h3>
          <p className="small">
            You can return what you bought for 30 days. Refunds go back to the PayPal payment after we confirm them.
          </p>
          {order.items.map((item) => {
            const left = item.quantity - keptQuantity(order, item.orderItemID);

            if (left <= 0) {
              return null;
            }

            return (
              <label className="return-line" key={item.orderItemID}>
                <span>
                  {item.color} · {item.capacity} · {left} left
                </span>
                <input name={`qty-${item.orderItemID}`} type="number" min="0" max={left} defaultValue="0" />
              </label>
            );
          })}
          <label className="field-label" htmlFor="reason">
            Why are you returning this?
          </label>
          <textarea id="reason" name="reason" maxLength="500" placeholder="A short reason" />
          <p className="form-error">{returnError}</p>
          <button type="submit" className="primary" disabled={sending}>
            Request return
          </button>
        </form>
      ) : (
        <p className="small">The 30-day return window for this order has closed.</p>
      )}
    </section>
  );
}

function stepCopy(label, order) {
  if (label === "Placed") {
    return ["Order placed", "We have your order"];
  }

  if (label === "Preparing") {
    return ["Preparing", "Packing your power bank"];
  }

  if (label === "Shipped") {
    return ["Shipped", order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Tracking number shows here"];
  }

  return ["Delivered", "Handed to you"];
}

function keptQuantity(order, itemId) {
  return (order.returns || [])
    .filter((row) => row.status !== "Rejected")
    .reduce((sum, row) => {
      const match = (row.items || []).filter((item) => item.orderItemID === itemId);
      return sum + match.reduce((inner, item) => inner + item.quantity, 0);
    }, 0);
}

function returnWindowOpen(createdAt) {
  const text = String(createdAt || "");
  const date = new Date(/Z$|[+-]\d\d:\d\d$/.test(text) ? text : `${text}Z`);
  return Date.now() - date.getTime() <= 30 * 24 * 60 * 60 * 1000;
}

function formatWhen(value) {
  const text = String(value || "");
  const date = new Date(/Z$|[+-]\d\d:\d\d$/.test(text) ? text : `${text}Z`);
  return date.toLocaleString();
}
