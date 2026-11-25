"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { AlertCircleIcon } from "@/components/ui/icons";
import { focusRing, inputClass, luxuryTransition } from "./styles";

type FieldRenderProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  id?: string;
  className?: string;
  children: (props: FieldRenderProps) => ReactNode;
};

export function Field({
  label,
  hint,
  error,
  required,
  id,
  className = "",
  children,
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="block text-caption font-medium tracking-label text-foreground uppercase"
        >
          {label}
          {required ? <span className="ml-1 text-danger">*</span> : null}
        </label>
      ) : null}
      {children({
        id: fieldId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint ? (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-start gap-2 text-caption text-danger">
          <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  wrapperClassName?: string;
};

export function Input({
  label,
  hint,
  error,
  id,
  className = "",
  wrapperClassName,
  required,
  ...props
}: InputProps) {
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
        <input
          {...props}
          {...fieldProps}
          required={required}
          className={`${inputClass} ${className}`.trim()}
        />
      )}
    </Field>
  );
}

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  wrapperClassName?: string;
};

export function Textarea({
  label,
  hint,
  error,
  id,
  className = "",
  wrapperClassName,
  required,
  ...props
}: TextareaProps) {
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
        <textarea
          {...props}
          {...fieldProps}
          required={required}
          className={`${inputClass} min-h-28 resize-y ${className}`.trim()}
        />
      )}
    </Field>
  );
}

type ChoiceFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> & {
  label: string;
  description?: string;
  error?: string;
  id?: string;
  type?: "checkbox" | "radio";
};

function ChoiceField({
  label,
  description,
  error,
  id,
  type = "checkbox",
  className = "",
  ...props
}: ChoiceFieldProps) {
  const generatedId = useId();
  const choiceId = id ?? generatedId;
  const descriptionId = description ? `${choiceId}-description` : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={choiceId}
          type={type}
          aria-describedby={descriptionId}
          aria-invalid={error ? true : undefined}
          className={[
            "mt-0.5 h-4 w-4 shrink-0 rounded-control border border-border bg-surface text-accent-strong",
            luxuryTransition,
            focusRing,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <label htmlFor={choiceId} className="text-body-sm text-foreground">
          {label}
        </label>
      </div>
      {description ? (
        <p id={descriptionId} className="pl-7 text-caption text-muted">
          {description}
        </p>
      ) : null}
      {error ? <p className="pl-7 text-caption text-danger">{error}</p> : null}
    </div>
  );
}

export function CheckboxField(props: Omit<ChoiceFieldProps, "type">) {
  return <ChoiceField {...props} type="checkbox" />;
}

export function RadioField(props: Omit<ChoiceFieldProps, "type">) {
  return <ChoiceField {...props} type="radio" />;
}

export type FormAlertProps = {
  children: ReactNode;
  tone?: "error" | "success" | "info";
  className?: string;
};

const alertStyles: Record<NonNullable<FormAlertProps["tone"]>, string> = {
  error: "border-danger/30 bg-danger/10 text-danger",
  success: "border-success/30 bg-success/10 text-success",
  info: "border-border bg-surface-muted text-foreground",
};

export function FormAlert({
  children,
  tone = "info",
  className = "",
}: FormAlertProps) {
  const role = tone === "error" || tone === "success" ? "alert" : "status";
  return (
    <div
      role={role}
      className={[
        "flex items-start gap-3 rounded-control border px-4 py-3 text-body-sm",
        alertStyles[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
