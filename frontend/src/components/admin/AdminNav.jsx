import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ITEMS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="flex flex-wrap items-center gap-2 border-y border-border py-4 text-[11px] uppercase tracking-[0.14em]">
      {ITEMS.map((item) => {
        const active = item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
        return (
          <Link key={item.to} to={item.to} className={`px-4 py-2 ${active ? "bg-foreground text-white" : "text-muted hover:text-foreground"}`}>
            {item.label}
          </Link>
        );
      })}
      <Link to="/" className="px-4 py-2 text-muted hover:text-foreground">View Store</Link>
      <button onClick={async () => { await logout(); nav("/admin/login"); }} className="ml-auto bg-foreground px-4 py-2 text-white hover:bg-accent">Logout</button>
    </nav>
  );
}
