"use client";

import { useId, useState, type FormEvent } from "react";

type Variant = "home" | "footer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm({ variant = "home" }: { variant?: Variant }) {
  const id = useId();
  const messageId = `${id}-message`;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const isFooter = variant === "footer";
  const inputClassName = isFooter
    ? "w-full border border-white/20 bg-transparent px-4 py-3 text-body-sm text-on-dark placeholder:text-on-dark/50 outline-none transition focus:border-accent"
    : "w-full border border-accent/30 bg-transparent px-5 py-4 text-body-sm text-foreground placeholder:text-muted outline-none transition focus:border-accent";
  const buttonClassName = isFooter
    ? "w-full border border-accent bg-accent px-4 py-3 text-eyebrow font-medium tracking-label text-foreground uppercase transition duration-[var(--duration-base)] ease-luxury hover:border-accent-strong hover:bg-accent-strong disabled:opacity-60"
    : "bg-accent px-8 py-4 text-eyebrow font-medium tracking-label text-foreground uppercase transition duration-[var(--duration-base)] ease-luxury hover:bg-accent-strong disabled:opacity-60";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value) || value.length > 254) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error?.message || "Unable to subscribe right now.");
      }
      setStatus("success");
      setMessage("Thank you for subscribing. Welcome to Auréa.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  }

  return (
    <div className={isFooter ? "mt-6" : "mx-auto mt-10 max-w-xl"}>
      <form onSubmit={onSubmit} className={isFooter ? "space-y-3" : "flex flex-col gap-4 sm:flex-row"}>
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby={message ? messageId : undefined}
          placeholder={isFooter ? "Enter your email" : "Enter your email address"}
          className={inputClassName}
        />
        <button type="submit" disabled={status === "loading"} className={buttonClassName}>
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {message ? (
        <p
          id={messageId}
          role={status === "error" ? "alert" : "status"}
          className={`mt-4 text-body-sm ${
            status === "error" ? (isFooter ? "text-[#ffb4a8]" : "text-danger") : "text-accent"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
