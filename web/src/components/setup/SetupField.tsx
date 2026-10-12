import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
  wide?: boolean;
};

export function SetupField({ label, hint, children, wide }: FieldProps) {
  return (
    <label className={`setup-field${wide ? " setup-field--wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "url";
  required?: boolean;
  wide?: boolean;
};

export function SetupInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  required = true,
  wide,
}: InputProps) {
  return (
    <SetupField label={label} hint={hint} wide={wide}>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </SetupField>
  );
}

type TextareaProps = Omit<InputProps, "type"> & { rows?: number };

export function SetupTextarea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  required = true,
  wide = true,
  rows = 4,
}: TextareaProps) {
  return (
    <SetupField label={label} hint={hint} wide={wide}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </SetupField>
  );
}
