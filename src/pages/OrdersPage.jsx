import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage } from "../api/client";
import { getMyOrders } from "../api/orderApi";
import { useStore } from "../context/StoreContext";
import { formatMoney } from "../data/catalog";

export function OrdersPage() {
  const { session, setAuthOpen } = useStore();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(session ? "loading" : "signed-out");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session) {
      setStatus("signed-out");
      return undefined;
    }

    let active = true;
    setStatus("loading");

    getMyOrders()
      .then((response) => {
        if (!active) {
          return;
        }

        setOrders(response.data || []);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setMessage(errorMessage(error, "Could not load your orders."));
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [session]);

  return (
    <section className="receipt">
      <div className="eyebrow">ACCOUNT</div>
      <h2 className="page-heading">Your orders</h2>
      {status === "signed-out" ? (
        <>
          <p className="muted">Sign in to see the orders on this account.</p>
          <button type="button" className="primary" onClick={() => setAuthOpen(true)}>
            Sign in
          </button>
        </>
      ) : null}
      {status === "loading" ? <p className="muted">Loading…</p> : null}
      {status === "error" ? <p className="form-error">{message}</p> : null}
      {status === "ready" && orders.length === 0 ? <p className="muted">You have no orders yet.</p> : null}
      {status === "ready" ? (
        <div className="orders">
          {orders.map((order) => (
            <Link className="order-card" key={order.orderNumber} to={`/orders/${order.orderNumber}`}>
              <b>{order.orderNumber}</b>
              <span className="small">{formatWhen(order.createdAt)}</span>
              <div>
                {order.items.map((item) => (
                  <div key={`${item.orderItemID}-${item.color}`}>
                    {item.color} · {item.capacity} × {item.quantity}
                  </div>
                ))}
              </div>
              <div className="small">
                {order.status} · {formatMoney(order.total, order.currency)}
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function formatWhen(value) {
  const text = String(value || "");
  const date = new Date(/Z$|[+-]\d\d:\d\d$/.test(text) ? text : `${text}Z`);
  return date.toLocaleString();
}
