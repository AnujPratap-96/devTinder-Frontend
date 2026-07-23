import { forwardRef } from "react";
import clsx from "clsx";
import Spinner from "./Spinner";

const baseStyles = "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold tracking-tight transition duration-200 ease-snappy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60";

const sizeStyles = {
  xs: "h-8 px-3 text-xs",
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "h-11 w-11 rounded-2xl p-0",
};

const variantStyles = {
  primary:
    "bg-gradient-to-r from-brand-500 via-brand-400 to-accent-cyan text-on-accent shadow-brand-glow hover:-translate-y-0.5 hover:shadow-brand-glow-strong active:translate-y-0",
  secondary:
    "border border-brand-400/40 bg-brand-500/10 text-brand-500 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-500/20 hover:text-brand-500",
  outline:
    "border border-hairline bg-transparent text-neutral-100 hover:bg-tint",
  subtle: "bg-tint text-neutral-100 hover:bg-tint",
  danger:
    "border border-danger-500/50 bg-danger-500/10 text-danger-600 hover:-translate-y-0.5 hover:border-danger-500 hover:bg-danger-500/20",
  ghost: "bg-transparent text-neutral-300 hover:bg-tint",
  success:
    "border border-success-500/50 bg-success-500/10 text-success-600 hover:-translate-y-0.5 hover:border-success-500 hover:bg-success-500/20 hover:text-success-700",
};

const spinnersBySize = {
  xs: "xs",
  sm: "sm",
  md: "sm",
  lg: "md",
  icon: "sm",
};

const Button = forwardRef(({ as: Component = "button", className, size = "md", variant = "primary", loading, disabled, children, ...props }, ref) => {
  const resolvedProps = { ...props, disabled: disabled || loading };

  if (Component === "button" && !resolvedProps.type) {
    resolvedProps.type = "button";
  }

  return (
    <Component
      ref={ref}
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...resolvedProps}
    >
      {loading ? <Spinner size={spinnersBySize[size] || "sm"} /> : children}
    </Component>
  );
});

Button.displayName = "Button";

export default Button;
