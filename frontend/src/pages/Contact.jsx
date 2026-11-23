import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-[11px] uppercase tracking-[0.24em] text-accent">Get in Touch</p>
      <h1 className="mt-3 font-display text-5xl">Contact Us</h1>
      <p className="mt-4 text-muted">We'd love to help you find the perfect piece.</p>
      {sent ? <p className="mt-8 border border-border p-6 text-sm text-muted">Thank you for your message. We'll get back to you soon.</p> : (
        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <input required placeholder="Full name" className="w-full border border-border px-4 py-3 outline-none focus:border-accent" />
          <input required type="email" placeholder="Email" className="w-full border border-border px-4 py-3 outline-none focus:border-accent" />
          <textarea required placeholder="Message" rows="5" className="w-full border border-border px-4 py-3 outline-none focus:border-accent" />
          <button className="bg-foreground px-8 py-3 text-[11px] uppercase tracking-[0.18em] text-white hover:bg-accent transition">Send Message</button>
        </form>
      )}
    </div>
  );
}
