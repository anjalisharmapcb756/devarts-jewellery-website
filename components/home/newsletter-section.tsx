"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/container";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="bg-[#292521] px-8 py-14 text-center text-[#F8F5F0] sm:px-12 sm:py-20">
          <p className="text-xs font-medium tracking-[0.32em] text-accent uppercase">
            Newsletter
          </p>
          <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
            Enter the world of Vara
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#D9D2C7]">
            Receive early access to new collections, private offers, and stories
            from our atelier.
          </p>
          <form
            onSubmit={onSubmit}
            className="mx-auto mt-10 flex max-w-xl flex-col gap-4 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full border border-accent/30 bg-transparent px-5 py-4 text-sm text-[#F8F5F0] outline-none placeholder:text-[#D9D2C7]/70 focus:border-accent"
            />
            <button
              type="submit"
              className="bg-accent px-8 py-4 text-xs font-medium tracking-[0.22em] text-white uppercase transition duration-200 hover:bg-accent-strong"
            >
              Subscribe
            </button>
          </form>
          {submitted ? (
            <p className="mt-4 text-sm text-accent">
              Thank you for subscribing. Welcome to Vara.
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
