/* eslint-disable react/prop-types */
const strengthGradient = [
  { threshold: 0, color: "bg-red-500/40" },
  { threshold: 40, color: "bg-orange-500/40" },
  { threshold: 70, color: "bg-emerald-500/40" },
  { threshold: 90, color: "bg-brand-500/40" },
];

const getStrengthColor = (score) => {
  let shade = "bg-neutral-500/30";
  for (const bucket of strengthGradient) {
    if (score >= bucket.threshold) {
      shade = bucket.color;
    }
  }
  return shade;
};

const humanize = (field) =>
  field
    .split(".")
    .pop()
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ProfileStrengthMeter = ({ profileStrength }) => {
  const score = profileStrength?.score ?? 0;
  const missing = profileStrength?.missingFields ?? [];
  const colorClass = getStrengthColor(score);

  return (
    <div className="mb-8 rounded-3xl border border-white/5 bg-surface-900/80 p-6 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Profile Strength
          </p>
          <p className="mt-1 text-lg font-semibold text-neutral-50">{score}% complete</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-neutral-300">
          {score >= 80 ? "Great" : score >= 50 ? "Good" : "Needs Work"}
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>

      {missing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500">
            Suggested improvements
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {missing.slice(0, 5).map((field) => (
              <li
                key={field}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-neutral-300"
              >
                {humanize(field)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileStrengthMeter;
