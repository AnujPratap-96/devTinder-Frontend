/* eslint-disable react/prop-types */
import { HiCode } from "react-icons/hi";
import Aurora from "./Aurora";

const Logo = () => (
  <div className="mb-8 flex items-center gap-2">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-purple text-lg text-on-accent shadow-brand-glow">
      <HiCode />
    </span>
    <span className="text-xl font-bold text-neutral-50">DevTinder</span>
  </div>
);

const StepIndicator = ({ steps, current }) => (
  <div className="mb-8 flex items-center gap-2">
    {steps.map((step, i) => (
      <div key={step} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
              i < current
                ? "bg-brand-500 text-white"
                : i === current
                ? "bg-gradient-to-br from-brand-500 to-accent-purple text-white"
                : "bg-tint text-neutral-500"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`hidden text-xs font-medium sm:block ${
              i <= current ? "text-brand-600" : "text-neutral-500"
            }`}
          >
            {step}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`h-px w-6 ${i < current ? "bg-brand-400/50" : "bg-tint-strong"}`}
          />
        )}
      </div>
    ))}
  </div>
);

const AuthShell = ({
  title,
  subtitle,
  visual,
  visualSide = "right",
  steps,
  currentStep,
  children,
  cardClassName = "",
}) => {
  const split = Boolean(visual);
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-neutral-950 px-4 py-10">
      <Aurora />
      <div
        className={`glass-elevated relative z-10 w-full overflow-hidden rounded-card border border-hairline ${
          split ? "max-w-4xl md:flex" : "max-w-md"
        } ${cardClassName}`}
      >
        {split && visualSide === "left" && (
          <div className="relative hidden bg-gradient-to-br from-surface-800 to-surface-950 p-10 md:flex md:w-1/2 flex-col items-center justify-center overflow-hidden">
            <div className="aurora-static opacity-50" aria-hidden="true" />
            <div className="relative z-10 w-full">{visual}</div>
          </div>
        )}

        <div className={`w-full p-8 sm:p-10 ${split ? "md:w-1/2" : ""}`}>
          <Logo />
          {steps && <StepIndicator steps={steps} current={currentStep} />}
          {title && <h2 className="mb-1 text-2xl font-bold text-neutral-50 sm:text-3xl">{title}</h2>}
          {subtitle && <p className="mb-8 text-sm text-neutral-400">{subtitle}</p>}
          {children}
        </div>

        {split && visualSide === "right" && (
          <div className="relative hidden bg-gradient-to-br from-surface-800 to-surface-950 p-10 md:flex md:w-1/2 flex-col items-center justify-center overflow-hidden">
            <div className="aurora-static opacity-50" aria-hidden="true" />
            <div className="relative z-10 w-full">{visual}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthShell;
