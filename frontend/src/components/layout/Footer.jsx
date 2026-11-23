import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="font-display text-3xl tracking-[0.08em]">VARA</div>
          <p className="mt-3 text-sm leading-6 text-muted">Timeless Indian luxury jewellery, crafted with elegance.</p>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground">Shop</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link to="/collections" className="hover:text-accent">Collections</Link>
            <Link to="/products" className="hover:text-accent">All Jewellery</Link>
            <Link to="/new-arrivals" className="hover:text-accent">New Arrivals</Link>
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground">Company</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link to="/about" className="hover:text-accent">About</Link>
            <Link to="/contact" className="hover:text-accent">Contact</Link>
            <Link to="/stores" className="hover:text-accent">Stores</Link>
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-foreground">Legal</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link to="/privacy" className="hover:text-accent">Privacy</Link>
            <Link to="/terms" className="hover:text-accent">Terms</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">© {new Date().getFullYear()} Vara. All rights reserved.</div>
    </footer>
  );
}
