/* eslint-disable react/prop-types */
const sizeMap = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-[3px]",
};

const Spinner = ({ size = "md", className = "" }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`spinner inline-block align-middle text-current ${sizeMap[size] || sizeMap.md} ${className}`}
  />
);

export default Spinner;
