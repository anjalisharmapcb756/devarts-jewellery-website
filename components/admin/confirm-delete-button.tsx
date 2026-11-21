"use client";

import { useState, useTransition } from "react";

export function ConfirmDeleteButton({
  action,
  id,
  label = "Delete",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="text-xs tracking-[0.12em] text-[#8a4b4b] uppercase hover:text-[#6b3030]">{label}</button>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md border border-[#ddd5ca] bg-[#fffdfa] p-6">
            <h3 className="font-display text-2xl text-[#292521]">Confirm deletion</h3>
            <p className="mt-3 text-sm leading-7 text-[#6e6861]">This action cannot be undone. Are you sure you want to delete this item?</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(async () => { const fd = new FormData(); fd.set("id", id); await action(fd); setOpen(false); })}
                className="bg-[#292521] px-5 py-3 text-xs tracking-[0.14em] text-white uppercase disabled:opacity-50"
              >
                {pending ? "Deleting..." : "Delete"}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="border border-[#ddd5ca] px-5 py-3 text-xs tracking-[0.14em] text-[#292521] uppercase">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}