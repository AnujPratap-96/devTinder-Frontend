/* eslint-disable react/prop-types */
import { forwardRef } from "react";

const AuthInput = forwardRef(({ label, icon: Icon, id, className = "", wrapperClassName = "", ...props }, ref) => (
  <div className={wrapperClassName}>
    {label && (
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.04em] text-neutral-400"
      >
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-neutral-500" />
      )}
      <input
        ref={ref}
        id={id}
        className={`input-base ${Icon ? "pl-11" : ""} ${className}`}
        {...props}
      />
    </div>
  </div>
));

AuthInput.displayName = "AuthInput";

export default AuthInput;
