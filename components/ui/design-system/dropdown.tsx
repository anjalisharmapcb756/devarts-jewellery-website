"use client";

import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { Field } from "./form-controls";
import { inputClass } from "./styles";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "children"
> & {
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  wrapperClassName?: string;
};

export function Select({
  options,
  placeholder,
  label,
  hint,
  error,
  id,
  className = "",
  wrapperClassName,
  required,
  ...props
}: SelectProps) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={wrapperClassName}
    >
      {(fieldProps) => (
        <div className="relative">
          <select
            {...props}
            {...fieldProps}
            required={required}
            className={`${inputClass} appearance-none pr-10 ${className}`.trim()}
          >
            {placeholder ? (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
        </div>
      )}
    </Field>
  );
}

export const Dropdown = Select;
