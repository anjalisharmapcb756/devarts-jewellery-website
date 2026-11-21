"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/components/store/store-provider";
import { products as mockProducts } from "@/lib/data/products";
import { formatCurrency } from "@/lib/utils";
import { formatSelection, getOriginalUnitPrice } from "@/lib/pricing";
import type { CartItem, Gemstone, MetalType, Product } from "@/types/product";

const SHIPPING_THRESHOLD = 50000;
const SHIPPING_FEE = 499;

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-2 text-xs font-medium tracking-[0.08em] uppercase transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-foreground hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

function EditCartModal({
  item,
  onClose,
}: {
  item: CartItem & { product: Product };
  onClose: () => void;
}) {
  const { updateCartItem } = useStore();
  const p = item.product;
  const isRing = p.category === "Rings" || p.category === "Engagement Rings";
  const [metal, setMetal] = useState<MetalType>(item.selection.metal);
  const [gemstone, setGemstone] = useState<Gemstone>(item.selection.gemstone);
  const [gemstoneSize, setGemstoneSize] = useState(item.selection.gemstoneSize);
  const [ringSize, setRingSize] = useState(item.selection.ringSize ?? p.ringSizes?.[2] ?? "US 7");
  const [quantity, setQuantity] = useState(item.quantity);

  const save = () => {
    updateCartItem(item.key, {
      quantity,
      selection: { metal, gemstone, gemstoneSize, ...(isRing ? { ringSize } : {}) },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#292521]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Edit cart item">
      <div className="w-full max-w-2xl bg-surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.2em] text-accent-strong uppercase">Edit Customization</p>
            <h2 className="mt-2 font-display text-3xl text-foreground">{p.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-foreground">Close</button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">Metal</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(p.availableMetals ?? []).map((o) => <OptionButton key={o} active={metal === o} onClick={() => setMetal(o)}>{o}</OptionButton>)}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">Gemstone</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(p.availableGemstones ?? []).map((o) => <OptionButton key={o} active={gemstone === o} onClick={() => setGemstone(o)}>{o}</OptionButton>)}
            </div>
          </div>
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">Gemstone Size</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(p.gemstoneSizes ?? []).map((o) => <OptionButton key={o} active={gemstoneSize === o} onClick={() => setGemstoneSize(o)}>{o}</OptionButton>)}
            </div>
          </div>
          {isRing ? (
            <div>
              <p className="text-xs tracking-[0.16em] text-muted uppercase">Ring Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(p.ringSizes ?? []).map((o) => <OptionButton key={o} active={ringSize === o} onClick={() => setRingSize(o)}>{o}</OptionButton>)}
              </div>
            </div>
          ) : null}
          <div>
            <p className="text-xs tracking-[0.16em] text-muted uppercase">Quantity</p>
            <div className="mt-2 inline-flex items-center border border-border">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-10 w-10 hover:bg-surface-muted" aria-label="Decrease quantity">−</button>
              <span className="flex h-10 w-12 items-center justify-center text-sm">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="h-10 w-10 hover:bg-surface-muted" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button type="button" onClick={save} className="flex-1 bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase hover:bg-accent-strong">Save Changes</button>
          <button type="button" onClick={onClose} className="border border-border px-6 py-4 text-xs font-medium tracking-[0.2em] text-foreground uppercase hover:border-accent">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function CartContent({ products = mockProducts }: { products?: Product[] }) {
  function findProduct(id: string) {
    return products.find((p) => p.id === id);
  }
  const { cart, removeFromCart, updateCartQuantity } = useStore();
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const items = useMemo(
    () =>
      cart
        .map((item) => {
          const product = findProduct(item.productId);
          if (!product) return null;
          return { ...item, product };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [cart, products],
  );

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discount = items.reduce((sum, item) => {
    const original = getOriginalUnitPrice(item.product, item.selection);
    return sum + Math.max(0, (original ?? item.unitPrice) - item.unitPrice) * item.quantity;
  }, 0);
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const editingItem = items.find((item) => item.key === editingKey) ?? null;

  if (!items.length) {
    return (
      <div className="mt-12 border border-border bg-surface-muted/30 p-10 text-center">
        <p className="font-display text-3xl text-foreground">Your bag is empty</p>
        <p className="mt-3 text-sm leading-7 text-muted">Discover timeless pieces crafted for every occasion.</p>
        <Link href="/products" className="mt-6 inline-flex bg-foreground px-6 py-4 text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong">
          Explore Jewellery
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {items.map((item) => (
            <article key={item.key} className="grid gap-6 border-b border-border pb-6 sm:grid-cols-[140px_1fr]">
              <Link href={`/products/${item.product.slug}`} className="relative block aspect-square bg-surface-muted">
                <Image src={item.product.image} alt={item.product.name} fill sizes="140px" className="object-cover" />
              </Link>
              <div className="flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <p className="text-xs tracking-[0.18em] text-muted uppercase">{item.product.category}</p>
                    <Link href={`/products/${item.product.slug}`} className="mt-1 block font-display text-2xl text-foreground hover:text-accent-strong">
                      {item.product.name}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-muted">{formatSelection(item.selection)}</p>
                    <p className="mt-2 text-sm text-muted">Unit price: <span className="text-foreground">{formatCurrency(item.unitPrice)}</span></p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-base text-foreground">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    {getOriginalUnitPrice(item.product, item.selection) ? (
                      <p className="text-sm text-muted line-through">{formatCurrency((getOriginalUnitPrice(item.product, item.selection) ?? 0) * item.quantity)}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center border border-border">
                    <button type="button" onClick={() => updateCartQuantity(item.key, item.quantity - 1)} className="h-10 w-10 text-foreground hover:bg-surface-muted" aria-label="Decrease quantity">−</button>
                    <span className="flex h-10 w-12 items-center justify-center text-sm">{item.quantity}</span>
                    <button type="button" onClick={() => updateCartQuantity(item.key, item.quantity + 1)} className="h-10 w-10 text-foreground hover:bg-surface-muted" aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" onClick={() => setEditingKey(item.key)} className="text-xs tracking-[0.14em] text-muted uppercase transition hover:text-foreground">Edit</button>
                  <button type="button" onClick={() => removeFromCart(item.key)} className="text-xs tracking-[0.14em] text-muted uppercase transition hover:text-foreground">Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit border border-border bg-surface-muted/30 p-6 lg:sticky lg:top-32">
          <p className="text-xs font-medium tracking-[0.24em] text-accent-strong uppercase">Order Summary</p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="text-foreground">{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Discount</span><span className="text-foreground">{discount > 0 ? `- ${formatCurrency(discount)}` : formatCurrency(0)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="text-foreground">{shipping === 0 ? "Complimentary" : formatCurrency(shipping)}</span></div>
            <div className="flex justify-between border-t border-border pt-4 text-base"><span className="text-foreground">Final Total</span><span className="text-foreground">{formatCurrency(total)}</span></div>
          </div>
          <Link href="/checkout" className="mt-6 block w-full bg-foreground px-6 py-4 text-center text-xs font-medium tracking-[0.2em] text-background uppercase transition hover:bg-accent-strong">
            Proceed to Checkout
          </Link>
          <p className="mt-4 text-xs leading-6 text-muted">Your selected metal, gemstone, size, and ring size are preserved for each cart item.</p>
        </aside>
      </div>
      {editingItem ? <EditCartModal item={editingItem} onClose={() => setEditingKey(null)} /> : null}
    </>
  );
}