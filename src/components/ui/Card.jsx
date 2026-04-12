import clsx from "clsx";

const toneStyles = {
  solid: "border border-white/10 bg-surface-900/90 shadow-soft",
  muted: "border border-white/5 bg-surface-800/70 shadow-soft",
  translucent: "border border-white/10 bg-white/5 backdrop-blur-xl shadow-soft",
  glass: "border border-white/10 bg-surface-900/60 backdrop-blur-xl shadow-soft",
  accent: "border border-brand-400/25 bg-gradient-to-br from-brand-500/15 via-brand-400/10 to-accent-cyan/10 shadow-brand-glow",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const interactiveStyles = "transition-transform duration-200 ease-snappy hover:-translate-y-1 hover:shadow-brand-glow";

const Card = ({
  as: Component = "div",
  tone = "solid",
  padding = "md",
  interactive = false,
  className,
  ...props
}) => {
  return (
    <Component
      className={clsx(
        "rounded-3xl",
        toneStyles[tone],
        paddingStyles[padding],
        interactive && interactiveStyles,
        className
      )}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }) => (
  <div
    className={clsx(
      "mb-4 flex items-start justify-between gap-4 border-b border-white/5 pb-4",
      className
    )}
    {...props}
  />
);

export const CardFooter = ({ className, ...props }) => (
  <div
    className={clsx(
      "mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-4",
      className
    )}
    {...props}
  />
);

export default Card;
