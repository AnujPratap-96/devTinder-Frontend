/* eslint-disable react/prop-types */
const Aurora = ({ static: isStatic = false, className = "" }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none ${isStatic ? "aurora-static" : "aurora"} ${className}`}
  />
);

export default Aurora;
