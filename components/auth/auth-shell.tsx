import Link from "next/link";
import { Container } from "@/components/ui/container";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-xl border border-border bg-surface p-8 sm:p-10">
          <p className="text-xs font-medium tracking-[0.28em] text-accent-text uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted">{description}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-8 border-t border-border pt-6 text-sm text-muted">{footer}</div> : null}
        </div>
      </Container>
    </section>
  );
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-accent-text underline underline-offset-4 transition hover:text-foreground">
      {children}
    </Link>
  );
}