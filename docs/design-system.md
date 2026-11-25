# Auréa Design System

This document describes the root Next.js design-system foundation. It is intentionally scoped to tokens and reusable primitives; page content, layouts and copy have not been redesigned.

## Architecture

- **Token source:** `app/globals.css` using Tailwind CSS v4 `@theme inline`.
- **Component source:** `components/ui/design-system/`.
- **Shared wrappers adopted:** `components/ui/container.tsx`, `components/ui/section-heading.tsx`, `components/products/product-card.tsx`.
- **Dependencies:** none added. All components use React, Next.js Link/Image and Tailwind utilities already in the project.

## Brand tokens

### Colour

| Token | Value | Intended use |
| --- | --- | --- |
| `--background` | `#f8f6f1` | Primary page background |
| `--background-secondary` / `--surface-muted` | `#f1ede5` | Secondary sections, disabled surfaces |
| `--surface` | `#fffdf9` | Cards, inputs, dialogs |
| `--foreground` | `#29251f` | Primary text |
| `--muted` | `#777168` | Secondary text |
| `--accent` | `#b89b62` | Champagne gold for borders, fills and decoration |
| `--accent-strong` | `#7a6238` | Hover/focus surfaces |
| `--accent-text` | `#6f5a32` | Accessible gold text on ivory/white surfaces |
| `--border` | `#e7e0d5` | Hairline borders |
| `--danger` / `--success` | `#8a4b4b` / `#4f7258` | Semantic feedback |
| `--focus` | `#7a6238` | Focus ring |
| `--on-dark` | `#fffdf9` | Text on dark surfaces |
| `--overlay` | `rgb(41 37 31 / 0.55)` | Modal scrim |

`#b89b62` does not meet AA contrast as small text on ivory, so it is reserved for decoration. Text uses the darker `--accent-text` derivative.

### Typography

- Display: `var(--font-cormorant-garamond)` from `next/font/google`.
- Body: `var(--font-inter)` from `next/font/google`.
- Generated text utilities: `text-eyebrow`, `text-caption`, `text-body-sm`, `text-body`, `text-body-lg`, `text-card-title`, `text-section`, `text-display-sm`, `text-display`.
- Tracking utilities: `tracking-eyebrow`, `tracking-label`, `tracking-display`.

### Spacing, shape, elevation and layout

- Spacing: `px-gutter`, `p-card`, `py-section`, `py-section-lg`.
- Radius: `rounded-control`, `rounded-card`, `rounded-pill`.
- Shadows: `shadow-card`, `shadow-raised`, `shadow-overlay`.
- Containers: `max-w-page`, `max-w-wide`, `max-w-copy`.
- Semantic breakpoints: `tablet:`, `desktop:`, `wide:` alongside existing `sm:`/`md:`/`lg:`/`xl:`.
- Buttons: height and horizontal padding tokens exposed as `--button-height-*`, `--button-padding-*`; the `Button` component consumes them.
- Motion: `duration-fast`, `duration-base`, `duration-slow`, `duration-reveal`, `ease-luxury`. Tailwind v4 does not create named `duration-*` utilities, so components consume them as `duration-[var(--duration-base)]`.
- Stacking: `z-header`, `z-overlay`, `z-modal`, `z-toast`, consumed as `z-[var(--z-modal)]`.

## Components

Import from `@/components/ui/design-system`.

| Component | Purpose |
| --- | --- |
| `Button`, `ButtonLink`, `buttonStyles` | Primary/secondary/ghost/link actions in three sizes; loading state with `aria-busy`. |
| `IconButton` | Icon-only control with required `aria-label`. |
| `Badge` | Neutral, accent, dark, outline, success and danger labels. |
| `Field`, `Input`, `Textarea`, `CheckboxField`, `RadioField`, `FormAlert` | Labelled form controls with hint/error wiring and live-region feedback. |
| `SearchBox` | Accessible search form with clear button and submit callback. |
| `Select` / `Dropdown` | Native select with label, hint, error and custom chevron. |
| `Modal` | Dialog with `role="dialog"`, `aria-modal`, focus trap, focus return, Escape and scroll lock. |
| `NavLink`, `NavList`, `NavListItem`, `Breadcrumbs` | Navigation primitives with `aria-current` support. |
| `DesignSystemProductCard` / `ProductCard` | Product image, badges, wishlist, add-to-bag and quick-view actions. |

## Accessibility notes

- A global `:where(...):focus-visible` rule provides a `--focus` outline. Components also expose `focusRing` for utility-level consistency.
- `Field` wires label, hint and error via `htmlFor`, `aria-describedby` and `aria-invalid`.
- `Modal` traps Tab focus, closes on Escape/backdrop, restores focus and locks body scroll.
- `IconButton` requires a `label`, which becomes `aria-label`.
- Product card images are decorative (`alt=""`) because the adjacent title link names the product; this avoids duplicate announcements.

## Migration boundary

Only shared primitives and tokens were changed. Individual page files, copy, section order and content structure remain untouched. Legacy hard-coded utility strings in older components still render through the same class names and will be migrated in a later content-safe pass.
