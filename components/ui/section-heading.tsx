type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "mx-auto text-center" : "text-left";

  return (
    <div className={`max-w-3xl ${alignment} ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-eyebrow font-medium tracking-eyebrow text-accent-text uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-4 font-display text-section tracking-display text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-body text-muted sm:text-body-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
