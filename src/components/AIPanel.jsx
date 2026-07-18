/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateBio, suggestSkills } from "../utils/aiApi";

// ─── Sparkle SVG icon ────────────────────────────────────────
const SparkleIcon = ({ className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
    <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
  </svg>
);

const LoadingDots = () => (
  <span className="inline-flex items-end gap-0.5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="block h-1.5 w-1.5 rounded-full bg-brand-500"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </span>
);

// ─────────────────────────────────────────────────────────────
// AIPanel
// Props:
//   user         – current user object (for fallback context)
//   skills       – current skills array (live from parent)
//   formData     – current form (role, experienceYears)
//   onBioGenerated(bio)          – parent handler
//   onSkillsAccepted(skills[])   – parent handler
// ─────────────────────────────────────────────────────────────
const AIPanel = ({ user, skills, formData, onBioGenerated, onSkillsAccepted }) => {
  // Bio state
  const [generatedBio, setGeneratedBio] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioError, setBioError] = useState("");

  // Skills state
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState("");

  // ── Bio generation ──────────────────────────────────────
  const handleGenerateBio = async () => {
    setBioLoading(true);
    setBioError("");
    setGeneratedBio("");
    try {
      const result = await generateBio({
        skills: skills?.length ? skills : user?.skills,
        experienceYears: formData?.experienceYears ?? user?.experienceYears,
        role: formData?.role ?? user?.role,
      });
      if (!result.success) throw new Error(result.message);
      setGeneratedBio(result.data.bio);
    } catch (err) {
      setBioError(err?.response?.data?.message || err.message || "AI service unavailable");
    } finally {
      setBioLoading(false);
    }
  };

  const handleUseBio = () => {
    if (generatedBio) {
      onBioGenerated(generatedBio);
      setGeneratedBio("");
    }
  };

  // ── Skill suggestions ───────────────────────────────────
  const handleSuggestSkills = async () => {
    setSkillsLoading(true);
    setSkillsError("");
    setSuggestedSkills([]);
    setSelectedSuggestions(new Set());
    try {
      const result = await suggestSkills({
        currentSkills: skills?.length ? skills : user?.skills,
        role: formData?.role ?? user?.role,
        about: formData?.about ?? user?.about,
      });
      if (!result.success) throw new Error(result.message);
      setSuggestedSkills(result.data.suggestions);
    } catch (err) {
      setSkillsError(err?.response?.data?.message || err.message || "AI service unavailable");
    } finally {
      setSkillsLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      return next;
    });
  };

  const handleAddSelected = () => {
    const toAdd = [...selectedSuggestions].filter((s) => !skills.includes(s));
    if (toAdd.length) {
      onSkillsAccepted([...skills, ...toAdd]);
      setSuggestedSkills([]);
      setSelectedSuggestions(new Set());
    }
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-brand-400/30 bg-gradient-to-br from-brand-500/10 via-transparent to-accent-purple/10 shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-brand-400/20 px-5 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15">
          <SparkleIcon className="h-5 w-5 text-brand-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-600">AI Assistant</p>
          <p className="text-[11px] text-neutral-500">Powered by Mistral — improve your profile instantly</p>
        </div>
        <span className="ml-auto rounded-full border border-brand-400/30 bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-600">
          Beta
        </span>
      </div>

      <div className="flex flex-col divide-y divide-brand-400/10">
        {/* ── Bio Generator Section ── */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-100">✍️ Bio Generator</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                AI writes a recruiter-friendly bio based on your skills & role.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateBio}
              disabled={bioLoading}
              className="shrink-0 flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-500/25 disabled:opacity-50"
            >
              {bioLoading ? (
                <>
                  <LoadingDots /> Generating…
                </>
              ) : (
                <>
                  <SparkleIcon className="h-3.5 w-3.5" /> Generate Bio
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {bioError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-lg border border-danger-400/30 bg-danger-500/10 px-3 py-2 text-xs text-danger-500"
              >
                {bioError}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {generatedBio && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                 className="mt-4 rounded-xl border border-brand-400/20 bg-brand-500/5 p-4"
              >
                <p className="mb-3 text-sm leading-relaxed text-neutral-200">{generatedBio}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUseBio}
                     className="flex-1 rounded-lg bg-brand-500 py-2 text-xs font-bold text-on-accent transition hover:bg-brand-600"
                  >
                    ✓ Use This Bio
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateBio}
                    disabled={bioLoading}
                     className="flex-1 rounded-lg border border-brand-400/30 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-500/10"
                  >
                    ↻ Regenerate
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Skill Suggestions Section ── */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-100">💡 Skill Suggestions</p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                AI recommends trending skills based on your current stack.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSuggestSkills}
              disabled={skillsLoading}
              className="shrink-0 flex items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/15 px-4 py-2 text-xs font-semibold text-brand-600 transition hover:bg-brand-500/25 disabled:opacity-50"
            >
              {skillsLoading ? (
                <>
                  <LoadingDots /> Thinking…
                </>
              ) : (
                <>
                  <SparkleIcon className="h-3.5 w-3.5" /> Suggest Skills
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {skillsError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 rounded-lg border border-danger-400/30 bg-danger-500/10 px-3 py-2 text-xs text-danger-500"
              >
                {skillsError}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {suggestedSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4"
              >
                <p className="mb-2 text-[11px] text-neutral-500">
                  Click to select skills, then add them to your profile:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills.map((skill) => {
                    const selected = selectedSuggestions.has(skill);
                    return (
                      <motion.button
                        key={skill}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSkill(skill)}
                         className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                           selected
                             ? "border-brand-400/60 bg-brand-500/20 text-brand-600"
                             : "border-hairline bg-tint text-neutral-300 hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-brand-600"
                         }`}
                      >
                        {selected ? "✓ " : "+ "}{skill}
                      </motion.button>
                    );
                  })}
                </div>

                {selectedSuggestions.size > 0 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    onClick={handleAddSelected}
                     className="mt-4 w-full rounded-xl bg-brand-500 py-2.5 text-sm font-bold text-on-accent transition hover:bg-brand-600"
                  >
                    Add {selectedSuggestions.size} skill{selectedSuggestions.size > 1 ? "s" : ""} to profile
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;
