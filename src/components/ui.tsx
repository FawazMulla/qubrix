import { useEffect, useId, useRef } from "react";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { LoaderCircle, X } from "lucide-react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({ variant = "primary", size = "md", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" | "lg"; children: ReactNode }) {
  return <button className={`btn btn-${variant} btn-${size}`} {...props}>{children}</button>;
}

export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button className="icon-button" aria-label={label} title={label} {...props}>{children}</button>;
}

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`card ${className}`} {...props}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "purple" | "cyan" | "success" | "danger" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Avatar({ initials, name, size = "md" }: { initials: string; name?: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`avatar avatar-${size}`} aria-label={name} title={name}>{initials}</span>;
}

export function Input({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return <label className="field">{label && <span className="field-label">{label}</span>}<input className={error ? "input input-error" : "input"} {...props} />{error && <span className="field-error">{error}</span>}</label>;
}

export function Select({ label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return <label className="field">{label && <span className="field-label">{label}</span>}<select className="select" {...props}>{children}</select></label>;
}

export function Tabs({ items, value, onChange }: { items: Array<{ value: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return <div className="tabs" role="tablist" aria-label="Tabs">{items.map((item) => <button key={item.value} type="button" role="tab" aria-selected={item.value === value} className={`tab ${item.value === value ? "tab-active" : ""}`} onClick={() => onChange(item.value)}>{item.label}</button>)}</div>;
}

export function Modal({ open, title, children, onClose, actions }: { open: boolean; title: string; children: ReactNode; onClose: () => void; actions?: ReactNode }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}><div className="modal-header"><h2 id={titleId}>{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={17} /></IconButton></div><div className="modal-body">{children}</div>{actions && <div className="modal-actions">{actions}</div>}</section></div>;
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return <span className="tooltip" data-tooltip={label}>{children}</span>;
}

export function Dropdown({ label, children }: { label: ReactNode; children: ReactNode }) {
  return <details className="dropdown"><summary>{label}</summary><div className="dropdown-menu">{children}</div></details>;
}

export function Breadcrumb({ items }: { items: Array<{ label: string; href?: string }> }) {
  return <nav className="breadcrumb-component" aria-label="Breadcrumb"><ol>{items.map((item, index) => <li key={item.label}>{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link to={item.href}>{item.label}</Link> : <strong>{item.label}</strong>}</li>)}</ol></nav>;
}

export function ProgressBar({ value, label, showValue = true }: { value: number; label?: string; showValue?: boolean }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div className="progress-wrap">{(label || showValue) && <div className="progress-label"><span>{label}</span>{showValue && <strong>{safeValue}%</strong>}</div>}<div className="progress-track" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}><span style={{ width: `${safeValue}%` }} /></div></div>;
}

export function PageHeader({ title, description, eyebrow, action }: { title: string; description?: string; eyebrow?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>;
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="section-header"><h2>{title}</h2>{action}</div>;
}

export function StatCard({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return <Card className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></Card>;
}

export function ChartContainer({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return <Card className="chart-container"><div className="chart-header"><div><h3>{title}</h3>{description && <p>{description}</p>}</div><Badge tone="neutral">Mock data</Badge></div><div className="chart-body">{children ?? <EmptyState title="Chart ready" description="Connect a mock dataset when this analytics view is implemented." />}</div></Card>;
}

export function CodeBlock({ code, language = "text" }: { code: string; language?: string }) {
  return <pre className="code-block" aria-label={`${language} code`}><code>{code}</code></pre>;
}

export function CodeEditor({ value, onChange, language = "text", readOnly = false }: { value: string; onChange?: (value: string) => void; language?: string; readOnly?: boolean }) {
  return <div className="code-editor"><div className="code-editor-bar"><span>{language}</span>{readOnly && <Badge tone="neutral">Read only</Badge>}</div><textarea aria-label={`${language} code editor`} value={value} readOnly={readOnly} onChange={(event) => onChange?.(event.target.value)} spellCheck={false} /></div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">◌</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function LoadingState({ label = "Loading Qubrix…" }: { label?: string }) {
  return <div className="state-card"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function ErrorState({ title = "Something went wrong", description = "This mock experience is temporarily unavailable.", action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="empty-state error-state"><div className="empty-icon">!</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Toast({ message, tone = "neutral" }: { message: string; tone?: "neutral" | "success" | "error" }) {
  return <div className={`toast toast-${tone}`} role="status" aria-live="polite">{message}</div>;
}
