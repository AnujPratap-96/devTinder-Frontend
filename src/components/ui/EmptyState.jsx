import clsx from "clsx";
import Card from "./Card";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = "muted",
  className,
}) => {
  return (
    <Card
      tone={tone}
      padding="lg"
      className={clsx(
        "flex flex-col items-center text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-brand-200 shadow-soft">
          {icon}
        </div>
      )}
      <h3 className="text-heading-sm text-neutral-50">{title}</h3>
      {description && (
        <p className="mt-3 max-w-sm text-body-sm text-neutral-400">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      )}
    </Card>
  );
};

export default EmptyState;
