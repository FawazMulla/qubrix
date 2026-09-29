import type { ButtonHTMLAttributes, InputHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  loading,
  icon,
  className = "",
  children,
  onClick,
  ...props
}: ButtonProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    window.dispatchEvent(new CustomEvent("qubrix-action", { detail: "Action selected" }));
  };
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={handleClick} {...props}>
      {loading ? <LoaderCircle className="spin" size={16} /> : icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (onClick) {
      onClick(event);
      return;
    }
    window.dispatchEvent(new CustomEvent("qubrix-action", { detail: label }));
  };
  return (
    <button aria-label={label} title={label} className={`icon-btn ${className}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  hint,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className={`field ${className}`}>
      {label && <span>{label}</span>}
      <input {...props} />
      {(error || hint) && <small className={error ? "field-error" : ""}>{error || hint}</small>}
    </label>
  );
}

export function Select({
  label,
  children,
  value,
  onChange,
}: {
  label?: string;
  children: ReactNode;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <label className="field compact">
      {label && <span>{label}</span>}
      <select value={value} onChange={onChange}>
        {children}
      </select>
    </label>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`card ${onClick ? "card-clickable" : ""} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function Heading({
  level = 2,
  children,
  className = "",
}: {
  level?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}) {
  return <div className={`heading heading-${level} ${className}`}>{children}</div>;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "cyan" | "success" | "warning";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress-wrap">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          <strong>{value}%</strong>
        </div>
      )}
      <div className="progress">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button className="toggle-row" onClick={onChange}>
      <span>{label}</span>
      <span className={`toggle ${checked ? "on" : ""}`}>
        <span />
      </span>
    </button>
  );
}
