import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { errorMessage } from "../../api/client";
import { capturePayPal, startPayPal } from "../../api/orderApi";
import { useStore } from "../../context/StoreContext";

export function PayPalSlot({ orderBody, validate }) {
  const slot = useRef(null);
  const navigate = useNavigate();
  const { session, paypalClientId, currency, setAuthOpen, clearCart } = useStore();
  const bodyRef = useRef(orderBody);
  const validateRef = useRef(validate);
  bodyRef.current = orderBody;
  validateRef.current = validate;

  useEffect(() => {
    const node = slot.current;

    if (!node || !session || !paypalClientId) {
      return undefined;
    }

    let cancelled = false;

    loadPayPal(paypalClientId, currency)
      .then(() => {
        if (cancelled || !slot.current || !window.paypal) {
          return;
        }

        slot.current.innerHTML = "";
        window.paypal
          .Buttons({
            onClick: (data, actions) => {
              const problem = validateRef.current();
              return problem ? actions.reject() : actions.resolve();
            },
            createOrder: async () => {
              try {
                const response = await startPayPal(bodyRef.current());
                return response.data.paypalOrderId;
              } catch (error) {
                const target = document.getElementById("checkout-error");

                if (target) {
                  target.textContent = errorMessage(error, "PayPal could not start the payment.");
                }

                throw error;
              }
            },
            onApprove: async (data) => {
              const response = await capturePayPal({
                ...bodyRef.current(),
                paypalOrderId: data.orderID,
              });
              clearCart();
              navigate(`/orders/${response.data.orderNumber}`, { state: { order: response.data } });
            },
            onError: () => {
              const target = document.getElementById("checkout-error");

              if (target) {
                target.textContent = "PayPal could not complete the payment.";
              }
            },
          })
          .render(slot.current);
      })
      .catch((error) => {
        if (!cancelled && node) {
          node.textContent = errorMessage(error, "PayPal could not load. Refresh the page and try again.");
        }
      });

    return () => {
      cancelled = true;

      if (node) {
        node.innerHTML = "";
      }
    };
  }, [session, paypalClientId, currency, clearCart, navigate]);

  if (!session) {
    return (
      <button type="button" className="primary full" onClick={() => setAuthOpen(true)}>
        Sign in to pay
      </button>
    );
  }

  if (!paypalClientId) {
    return <p className="small">PayPal is not configured.</p>;
  }

  return <div ref={slot} />;
}

const loaded = { currency: "", promise: null };

function loadPayPal(clientId, currency) {
  if (window.paypal && loaded.currency === currency) {
    return Promise.resolve();
  }

  if (loaded.promise && loaded.currency === currency) {
    return loaded.promise;
  }

  const previous = document.getElementById("paypal-sdk");

  if (previous) {
    previous.remove();
  }

  delete window.paypal;
  loaded.currency = currency;
  loaded.promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=capture`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("paypal"));
    document.body.appendChild(script);
  });

  return loaded.promise;
}
