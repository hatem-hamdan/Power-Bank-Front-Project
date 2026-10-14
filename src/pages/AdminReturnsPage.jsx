import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { errorMessage } from "../api/client";
import { getAdminReturns, refundReturn, rejectReturn } from "../api/orderApi";
import { useStore } from "../context/StoreContext";
import { formatMoney } from "../data/catalog";

export function AdminReturnsPage() {
  const { session, setAuthOpen } = useStore();
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState("");

  useEffect(() => {
    if (session?.role !== "Admin") {
      return undefined;
    }

    let active = true;

    getAdminReturns()
      .then((response) => {
        if (active) {
          setRows(response.data || []);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(errorMessage(error, "Could not load returns."));
        }
      });

    return () => {
      active = false;
    };
  }, [session]);

  async function decide(returnNumber, action) {
    setPending(returnNumber);
    setMessage(action === "refund" ? "Refunding with PayPal…" : "Rejecting…");

    try {
      if (action === "refund") {
        await refundReturn(returnNumber);
      } else {
        await rejectReturn(returnNumber);
      }

      const response = await getAdminReturns();
      setRows(response.data || []);
      setMessage("");
    } catch (error) {
      setMessage(errorMessage(error, "Could not update this return."));
    } finally {
      setPending("");
    }
  }

  if (!session) {
    return (
      <section className="receipt">
        <h2>Return requests</h2>
        <p className="muted">Sign in with an admin account.</p>
        <button type="button" className="primary" onClick={() => setAuthOpen(true)}>
          Sign in
        </button>
      </section>
    );
  }

  if (session.role !== "Admin") {
    return (
      <section className="receipt">
        <h2>Return requests</h2>
        <p className="muted">This page is for the store admin.</p>
        <Link className="text-button" to="/">
          ← Back to store
        </Link>
      </section>
    );
  }

  return (
    <section className="receipt">
      <Link className="text-button" to="/">
        ← Back to store
      </Link>
      <h2 className="page-heading">Return requests</h2>
      <p className="form-error">{message}</p>
      {rows.length === 0 ? <p className="muted">No return requests yet.</p> : null}
      <div className="orders">
        {rows.map((row) => (
          <article className="order-card" key={row.returnNumber}>
            <b>{row.returnNumber}</b>
            <div className="small">
              {row.orderNumber} · {row.email}
            </div>
            {row.items.map((item) => (
              <div key={`${row.returnNumber}-${item.orderItemID}`}>
                {item.color} · {item.capacity} × {item.quantity}
              </div>
            ))}
            <div className="small">
              {row.status} · {formatMoney(row.amount, row.currency)} · {new Date(row.createdAt).toLocaleString()}
            </div>
            <div>{row.reason}</div>
            {row.status === "Requested" ? (
              <div className="inline-row" style={{ marginTop: 8 }}>
                <button type="button" className="primary compact" disabled={pending === row.returnNumber} onClick={() => decide(row.returnNumber, "refund")}>
                  Refund
                </button>
                <button type="button" className="ghost compact" disabled={pending === row.returnNumber} onClick={() => decide(row.returnNumber, "reject")}>
                  Reject
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
