export interface DemoButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
}

export function DemoButton({
  children,
  variant = "primary",
  href = "#",
}: DemoButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400";

  return (
    <a href={href} className={`${base} ${styles}`}>
      {children}
    </a>
  );
}
