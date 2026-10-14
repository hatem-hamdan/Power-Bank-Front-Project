import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney } from "../../data/catalog";
import { AccountMenu } from "./AccountMenu";

export function Header() {
  const { currency, setCurrency, itemCount, setBagOpen, session, setAuthOpen } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const ship = formatMoney(currency === "GBP" ? 5.5 : 7, currency);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="announcement">
        Shipping {ship} to the US and UK · Free when you buy 2
      </div>
      <header className={menuOpen ? "header menu" : "header"}>
        <div className="brand-row">
          <Link className="logo" to="/" onClick={closeMenu}>
            TINY<i>VOLT</i>
          </Link>
          <button
            type="button"
            className="ghost compact menu-button"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
        <nav className="nav-links" onClick={closeMenu}>
          <Link to="/#features">Features</Link>
          <Link to="/#specs">Specs</Link>
          <Link to="/#reviews">Reviews</Link>
          <Link to="/#faq">FAQ</Link>
        </nav>
        <div className="header-actions header-slot">
          <span className="currency">
            <button type="button" className={currency === "USD" ? "on" : ""} onClick={() => setCurrency("USD")}>
              USD $
            </button>
            <button type="button" className={currency === "GBP" ? "on" : ""} onClick={() => setCurrency("GBP")}>
              GBP £
            </button>
          </span>
          <button type="button" className="ghost compact" onClick={() => setBagOpen(true)}>
            Bag
            {itemCount > 0 ? <span className="bag-count">{itemCount}</span> : null}
          </button>
          {session ? (
            <button type="button" className="ghost compact account" onClick={() => setAccountOpen((open) => !open)}>
              <span className="avatar">{session.name.trim().charAt(0).toUpperCase()}</span>
              {session.name.split(" ")[0]}
            </button>
          ) : (
            <button type="button" className="ghost compact" onClick={() => setAuthOpen(true)}>
              Sign in
            </button>
          )}
          {accountOpen && session ? <AccountMenu onClose={() => setAccountOpen(false)} /> : null}
        </div>
      </header>
    </>
  );
}
