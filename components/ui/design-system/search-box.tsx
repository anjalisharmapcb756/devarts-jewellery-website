"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import { luxuryTransition } from "./styles";

export type SearchBoxProps = {
  name?: string;
  placeholder?: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  autoFocus?: boolean;
  className?: string;
  submitLabel?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
};

export function SearchBox({
  name = "q",
  placeholder = "Search Auréa",
  label = "Search products",
  defaultValue = "",
  value,
  autoFocus,
  className = "",
  submitLabel = "Search",
  onChange,
  onSubmit,
}: SearchBoxProps) {
  const generatedId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  function updateValue(next: string) {
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.(currentValue.trim());
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={[
        "flex w-full items-center gap-2 border border-border bg-surface px-3 py-2",
        luxuryTransition,
        "focus-within:border-accent-strong",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label htmlFor={generatedId} className="sr-only">
        {label}
      </label>
      <SearchIcon className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
      <input
        id={generatedId}
        name={name}
        type="search"
        value={currentValue}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => updateValue(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-body-sm text-foreground outline-none placeholder:text-muted"
      />
      {currentValue ? (
        <IconButton
          label="Clear search"
          size="sm"
          variant="ghost"
          onClick={() => updateValue("")}
        >
          <CloseIcon className="h-4 w-4" />
        </IconButton>
      ) : null}
      <Button type="submit" size="sm" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
