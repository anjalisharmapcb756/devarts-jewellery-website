import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-3xl tracking-[0.08em] text-foreground">VARA</Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `text-[11px] uppercase tracking-[0.18em] transition hover:text-accent ${isActive ? "text-accent" : "text-muted"}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          <Link to="/search" className="hidden hover:text-accent sm:inline" aria-label="Search jewellery">Search</Link>
          <Link to="/wishlist" className="hidden hover:text-accent sm:inline">Wishlist ({wishlist.length})</Link>
          <Link to="/cart" className="hover:text-accent">Cart ({cartCount})</Link>
          <button
            type="button"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          {user ? (
            <>
              <Link to="/account" className="hidden hover:text-accent sm:inline">{user.name || "Account"}</Link>
              {user.role === "admin" && <Link to="/admin" className="hidden hover:text-accent md:inline">Dashboard</Link>}
              <button onClick={logout} className="hidden hover:text-accent sm:inline">Logout</button>
            </>
          ) : (
            <Link to="/login" className="hidden hover:text-accent sm:inline">Login</Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-navigation" className="border-t border-border bg-surface px-4 py-5 sm:px-6 md:hidden" aria-label="Mobile navigation">
          <div className="grid gap-4">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `text-sm uppercase tracking-[0.14em] ${isActive ? "text-accent" : "text-muted"}`}>
                {item.label}
              </NavLink>
            ))}
            <Link to="/search" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.14em] text-muted">Search</Link>
            <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.14em] text-muted">Wishlist ({wishlist.length})</Link>
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.14em] text-muted">Account</Link>
                {user.role === "admin" && <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.14em] text-muted">Dashboard</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-sm uppercase tracking-[0.14em] text-muted">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm uppercase tracking-[0.14em] text-muted">Login</Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
