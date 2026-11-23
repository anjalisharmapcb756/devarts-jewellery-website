import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useStore } from "../../context/StoreContext";

const nav = [
  { to: "/collections", label: "Collections" },
  { to: "/products", label: "All Jewellery" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount, wishlist } = useStore();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-3xl tracking-[0.08em] text-foreground">VARA</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-[11px] uppercase tracking-[0.18em] transition hover:text-accent ${isActive ? "text-accent" : "text-muted"}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          <Link to="/wishlist" className="hover:text-accent">Wishlist ({wishlist.length})</Link>
          <Link to="/cart" className="hover:text-accent">Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/account" className="hover:text-accent">{user.name || "Account"}</Link>
              {user.role === "admin" && <Link to="/admin" className="hover:text-accent">Dashboard</Link>}
              <button onClick={logout} className="hover:text-accent">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-accent">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
