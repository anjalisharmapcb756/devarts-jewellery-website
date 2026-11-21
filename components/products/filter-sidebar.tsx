"use client";

import { jewelleryTypes, gemstones, metalTypes, occasions } from "@/lib/data/products";

export type Filters = {
  jewelleryType: string[];
  priceRange: string;
  gemstone: string[];
  metal: string[];
  occasion: string[];
  availability: string[];
};

export const defaultFilters: Filters = {
  jewelleryType: [],
  priceRange: "",
  gemstone: [],
  metal: [],
  occasion: [],
  availability: [],
};

const priceRanges = [
  { label: "Under ₹50,000", value: "0-50000" },
  { label: "₹50,000 – ₹1,00,000", value: "50000-100000" },
  { label: "₹1,00,000 – ₹1,50,000", value: "100000-150000" },
  { label: "Above ₹1,50,000", value: "150000-" },
];

type FilterSidebarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  lockedCategory?: string;
};

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="border-b border-border py-6">
      <p className="text-xs font-medium tracking-[0.22em] text-foreground uppercase">{title}</p>
      <div className="mt-4 space-y-3">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 accent-accent"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterSidebar({ filters, onChange, lockedCategory }: FilterSidebarProps) {
  const toggle = (key: keyof Filters, value: string) => {
    const current = filters[key];
    if (Array.isArray(current)) {
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      onChange({ ...filters, [key]: next });
    }
  };

  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <div className="flex items-center justify-between border-b border-border pb-5">
        <h2 className="font-display text-2xl tracking-tight text-foreground">Filters</h2>
        <button
          type="button"
          onClick={() => onChange({ ...defaultFilters, jewelleryType: lockedCategory ? [lockedCategory] : [] })}
          className="text-xs tracking-[0.14em] text-muted uppercase transition hover:text-foreground"
        >
          Clear All
        </button>
      </div>

      {!lockedCategory ? (
        <CheckboxGroup title="Jewellery Type" options={jewelleryTypes} selected={filters.jewelleryType} onToggle={(v) => toggle("jewelleryType", v)} />
      ) : null}

      <div className="border-b border-border py-6">
        <p className="text-xs font-medium tracking-[0.22em] text-foreground uppercase">Price Range</p>
        <div className="mt-4 space-y-3">
          {priceRanges.map((range) => (
            <label key={range.value} className="flex cursor-pointer items-center gap-3 text-sm text-muted">
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange === range.value}
                onChange={() => onChange({ ...filters, priceRange: range.value })}
                className="h-4 w-4 accent-accent"
              />
              <span>{range.label}</span>
            </label>
          ))}
          {filters.priceRange ? (
            <button type="button" onClick={() => onChange({ ...filters, priceRange: "" })} className="text-xs text-accent-strong underline underline-offset-4">
              Clear price
            </button>
          ) : null}
        </div>
      </div>

      <CheckboxGroup title="Gemstone" options={gemstones} selected={filters.gemstone} onToggle={(v) => toggle("gemstone", v)} />
      <CheckboxGroup title="Metal Type" options={metalTypes} selected={filters.metal} onToggle={(v) => toggle("metal", v)} />
      <CheckboxGroup title="Occasion" options={occasions} selected={filters.occasion} onToggle={(v) => toggle("occasion", v)} />
      <CheckboxGroup title="Availability" options={["In Stock", "Out of Stock"]} selected={filters.availability} onToggle={(v) => toggle("availability", v)} />
    </aside>
  );
}
