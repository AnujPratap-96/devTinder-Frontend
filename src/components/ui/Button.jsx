import { forwardRef } from "react";
import clsx from "clsx";

const baseStyles = "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition duration-200 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:cursor-not-allowed disabled:opacity-60";

const sizeStyles = {
  xs: "h-8 px-3 text-xs",
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "h-11 w-11 rounded-2xl p-0",
};

const variantStyles = {
  primary:
    "bg-gradient-to-r from-brand-500 via-brand-400 to-accent-cyan text-neutral-50 shadow-brand-glow hover:-translate-y-0.5 hover:shadow-brand-glow-strong active:translate-y-0",
  secondary:
    "border border-brand-400/40 bg-brand-500/10 text-brand-100 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-500/20 hover:text-brand-50",
  outline:
    "border border-white/10 bg-transparent text-neutral-100 hover:bg-white/5",
  subtle: "bg-white/5 text-neutral-100 hover:bg-white/8",
  danger:
    "border border-danger-400/40 bg-danger-500/10 text-danger-400 hover:-translate-y-0.5 hover:border-danger-400 hover:bg-danger-500/20 hover:text-danger-100",
  ghost: "bg-transparent text-neutral-300 hover:bg-white/5",
  success:
    "border border-success-400/40 bg-success-500/15 text-success-400 hover:-translate-y-0.5 hover:border-success-400 hover:bg-success-500/25 hover:text-success-100",
};

const Button = forwardRef(({ as: Component = "button", className, size = "md", variant = "primary", ...props }, ref) => {
  const resolvedProps = { ...props };

  if (Component === "button" && !resolvedProps.type) {
    resolvedProps.type = "button";
  }

  return (
    <Component
      ref={ref}
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...resolvedProps}
    />
  );
});

Button.displayName = "Button";

export default Button;
