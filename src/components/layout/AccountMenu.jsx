import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export function AccountMenu({ onClose }) {
  const { session, signOut } = useStore();

  return (
    <div className="account-menu">
      <div className="who">
        <b>{session.name}</b>
        <span className="small">{session.email}</span>
      </div>
      <Link to="/orders" onClick={onClose}>
        Your orders
      </Link>
      {session.role === "Admin" ? (
        <Link to="/admin/returns" onClick={onClose}>
          Return requests
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() => {
          signOut();
          onClose();
        }}
      >
        Sign out
      </button>
    </div>
  );
}
