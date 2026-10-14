import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAuthConfig, getMe } from "../api/authApi";
import { clearStoredSession, readStoredSession, writeStoredSession } from "../api/client";
import { getProducts } from "../api/productApi";
import {
  FALLBACK_VARIANTS,
  PRODUCT_DESCRIPTION,
  PRODUCT_NAME,
  findVariant,
  shippingCost,
  unitPrice,
} from "../data/catalog";

const StoreContext = createContext(null);

function initialCurrency() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return zone === "Europe/London" ? "GBP" : "USD";
}

function sessionFromAuth(auth) {
  return {
    name: auth.user.fullName,
    email: auth.user.email,
    provider: auth.user.provider,
    role: auth.user.role || "Customer",
    token: auth.token,
    expiresAt: auth.expiresAt,
  };
}

export function StoreProvider({ children }) {
  const [currency, setCurrency] = useState(initialCurrency);
  const [session, setSession] = useState(readStoredSession);
  const [cart, setCart] = useState([]);
  const [product, setProduct] = useState(null);
  const [catalogNote, setCatalogNote] = useState("");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [googleClientId, setGoogleClientId] = useState("");
  const [bagOpen, setBagOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const variants = product?.variants?.length ? product.variants : FALLBACK_VARIANTS;
  const productName = product?.name || PRODUCT_NAME;
  const productDescription = product?.description || PRODUCT_DESCRIPTION;

  useEffect(() => {
    let active = true;

    getProducts()
      .then((response) => {
        if (!active) {
          return;
        }

        const first = response.data?.[0];

        if (first) {
          setProduct(first);
          setCatalogNote("");
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (error.response?.status !== 404) {
          setCatalogNote("The store could not load live prices. Refresh the page and try again.");
        }
      });

    getAuthConfig()
      .then((response) => {
        if (!active) {
          return;
        }

        setGoogleClientId(response.data.googleClientId || "");
        setPaypalClientId(response.data.paypalClientId || "");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    let active = true;

    getMe()
      .then((response) => {
        if (!active || !response.data) {
          return;
        }

        setSession((current) => {
          if (!current) {
            return current;
          }

          const next = {
            ...current,
            role: response.data.role || "Customer",
            name: response.data.fullName || current.name,
            email: response.data.email || current.email,
          };
          writeStoredSession(next);
          return next;
        });
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [session?.token]);

  useEffect(() => {
    const onSignedOut = () => setSession(null);
    window.addEventListener("tinyvolt-signed-out", onSignedOut);
    return () => window.removeEventListener("tinyvolt-signed-out", onSignedOut);
  }, []);

  function saveSession(auth) {
    const next = sessionFromAuth(auth);
    writeStoredSession(next);
    setSession(next);
    setAuthOpen(false);
  }

  function signOut() {
    clearStoredSession();
    setSession(null);

    if (window.google?.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  }

  function addToBag(color, capacity, quantity) {
    const variant = findVariant(variants, color, capacity);
    const key = `${color}|${capacity}`;

    setCart((current) => {
      const existing = current.find((line) => line.key === key);

      if (existing) {
        return current.map((line) =>
          line.key === key
            ? { ...line, quantity: Math.min(10, line.quantity + quantity), variantId: variant?.variantID || line.variantId }
            : line
        );
      }

      return [
        ...current,
        {
          key,
          color,
          capacity,
          quantity,
          variantId: variant?.variantID || 0,
        },
      ];
    });
    setBagOpen(true);
  }

  function changeLine(key, delta) {
    setCart((current) =>
      current
        .map((line) => {
          if (line.key !== key) {
            return line;
          }

          return { ...line, quantity: Math.min(10, Math.max(0, line.quantity + delta)) };
        })
        .filter((line) => line.quantity > 0)
    );
  }

  function removeLine(key) {
    setCart((current) => current.filter((line) => line.key !== key));
  }

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const itemsTotal = cart.reduce((sum, line) => {
    const variant = findVariant(variants, line.color, line.capacity);
    return sum + unitPrice(variant, currency) * line.quantity;
  }, 0);
  const shipping = cart.length ? shippingCost(itemCount, currency) : 0;
  const amountDue = itemsTotal + shipping;

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      session,
      saveSession,
      signOut,
      cart,
      addToBag,
      changeLine,
      removeLine,
      clearCart: () => setCart([]),
      variants,
      productName,
      productDescription,
      catalogNote,
      paypalClientId,
      googleClientId,
      bagOpen,
      setBagOpen,
      authOpen,
      setAuthOpen,
      itemCount,
      itemsTotal,
      shipping,
      amountDue,
    }),
    [
      currency,
      session,
      cart,
      variants,
      productName,
      productDescription,
      catalogNote,
      paypalClientId,
      googleClientId,
      bagOpen,
      authOpen,
      itemCount,
      itemsTotal,
      shipping,
      amountDue,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}
