/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { HiUpload, HiX, HiCode, HiSave, HiCamera } from "react-icons/hi";
import { FaCheckCircle, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";
import { addUser } from "../store/userSlice";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import Button from "./ui/Button";
import AIPanel from "./AIPanel";
import ProfileViews from "./ProfileViews";
import { syncGitHubData } from "../utils/aiApi";

const roleOptions = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "design",
  "product",
  "data",
  "devops",
  "other",
];

const availabilityOptions = [
  { value: "open", label: "Open to opportunities" },
  { value: "busy", label: "Currently busy" },
  { value: "not_looking", label: "Not looking" },
];

const themeOptions = [
  { value: "default", label: "Default" },
  { value: "glassmorphism", label: "Glassmorphism" },
  { value: "matrix", label: "Matrix Hacker" },
  { value: "neon", label: "Neon Synthwave" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "minimal", label: "Minimalist" },
  { value: "hacker", label: "Terminal Hacker" }
];

const themeStyles = {
  default: {
    shadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
    gradient: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)",
    font: "sans",
    badgeBg: "rgba(99,102,241,0.2)",
    badgeColor: "#c7d2fe",
    badgeBorder: "rgba(99,102,241,0.3)"
  },
  matrix: {
    shadow: "0 20px 60px rgba(0,40,0,0.9), 0 0 0 2px rgba(34,197,94,0.4)",
    gradient: "linear-gradient(to bottom, rgba(0,25,0,0.2) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.95) 100%)",
    font: "mono text-green-400 font-mono",
    badgeBg: "rgba(34,197,94,0.2)",
    badgeColor: "#86efac",
    badgeBorder: "rgba(34,197,94,0.4)"
  },
  hacker: {
    shadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(74,222,128,0.5)",
    gradient: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.95) 100%)",
    font: "mono text-green-500 font-mono",
    badgeBg: "black",
    badgeColor: "#22c55e",
    badgeBorder: "rgba(34,197,94,0.5)"
  },
  neon: {
    shadow: "0 20px 60px rgba(236,72,153,0.3), 0 0 20px rgba(139,92,246,0.4), 0 0 0 1px #ec4899",
    gradient: "linear-gradient(to bottom, rgba(40,0,40,0.1) 0%, rgba(20,0,40,0.3) 40%, rgba(0,0,0,0.9) 100%)",
    font: "sans",
    badgeBg: "rgba(236,72,153,0.2)",
    badgeColor: "#fbcfe8",
    badgeBorder: "rgba(236,72,153,0.5)"
  },
  cyberpunk: {
    shadow: "0 20px 60px rgba(234,179,8,0.2), 8px 8px 0px rgba(59,130,246,0.5), 0 0 0 2px #eab308",
    gradient: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(30,30,0,0.3) 40%, rgba(10,10,20,0.95) 100%)",
    font: "sans uppercase tracking-wide",
    badgeBg: "rgba(234,179,8,0.2)",
    badgeColor: "#fef08a",
    badgeBorder: "rgba(234,179,8,0.8)"
  },
  glassmorphism: {
    shadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.2)",
    gradient: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.8) 100%)",
    font: "sans tracking-tight",
    badgeBg: "rgba(255,255,255,0.1)",
    badgeColor: "white",
    badgeBorder: "rgba(255,255,255,0.3)"
  },
  minimal: {
    shadow: "0 10px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03)",
    gradient: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.9) 100%)",
    font: "sans font-light tracking-wide",
    badgeBg: "rgba(38,38,38,0.5)",
    badgeColor: "#d4d4d8",
    badgeBorder: "rgba(63,63,70,1)"
  }
};

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    age: user.age || "",
    gender: user.gender || "",
    about: user.about || "",
    role: user.role || "",
    experienceYears: user.experienceYears ?? 0,
    availability: user.availability || "open",
    theme: user.theme || "default",
    socialLinks: {
      github: user.socialLinks?.github || "",
      linkedin: user.socialLinks?.linkedin || "",
      portfolio: user.socialLinks?.portfolio || "",
    },
  });
  const [skills, setSkills] = useState(user.skills || []);
  const [gallery, setGallery] = useState([...(user.photoUrl || [])]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [githubToken, setGithubToken] = useState(user.githubProfile?.token || "");
  const [syncingGithub, setSyncingGithub] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      age: user.age || "",
      gender: user.gender || "",
      about: user.about || "",
      role: user.role || "",
      experienceYears: user.experienceYears ?? 0,
      availability: user.availability || "open",
      theme: user.theme || "default",
      socialLinks: {
        github: user.socialLinks?.github || "",
        linkedin: user.socialLinks?.linkedin || "",
        portfolio: user.socialLinks?.portfolio || "",
      },
    });
    setSkills(user.skills || []);
    setGallery([...(user.photoUrl || [])]);
  }, [user]);

  const handleChange = (key, nestedKey) => (event) => {
    if (nestedKey) {
      setFormData((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [nestedKey]: event.target.value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: key === "experienceYears" || key === "age" ? event.target.value.replace(/[^0-9]/g, "") : event.target.value,
      }));
    }
  };

  const refreshUser = async () => {
    const res = await axios.get(`${BASE_URL}/profile/view`, {
      withCredentials: true,
    });
    dispatch(addUser(res?.data?.user));
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        experienceYears: formData.experienceYears ? Number(formData.experienceYears) : 0,
        skills,
        socialLinks: formData.socialLinks,
      };
      const res = await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });
      dispatch(addUser(res?.data?.data?.user));
      addToast("Profile updated", "success");
    } catch (error) {
      addToast(error?.response?.data?.message || "Unable to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadImage = async () => {
    if (selectedIndex === null || !selectedFile) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("image", selectedFile);
      form.append("index", selectedIndex);
      const res = await axios.patch(`${BASE_URL}/profile/upload-image`, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 200) {
        const updatedGallery = [...gallery];
        updatedGallery[selectedIndex] = res.data.data.secureUrl;
        setGallery(updatedGallery);
        dispatch(addUser({ ...user, photoUrl: updatedGallery }));
        addToast("Image uploaded", "success");
        setOpenModal(false);
        setSelectedFile(null);
        setSelectedIndex(null);
      }
    } catch (error) {
      addToast(error?.response?.data?.message || "Image upload failed", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocationUpdate = () => {
    if (!("geolocation" in navigator)) {
      addToast("Geolocation not supported", "error");
      return;
    }
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.patch(
            `${BASE_URL}/profile/location`,
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            { withCredentials: true }
          );
          await refreshUser();
          addToast("Location updated", "success");
        } catch (error) {
          addToast(error?.response?.data?.message || "Unable to update location", "error");
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        addToast(error.message || "Location permission denied", "error");
        setUpdatingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };



  const handleGithubSync = async () => {
    if (!githubToken.trim()) {
      addToast("Provide a GitHub personal access token", "info");
      return;
    }
    setSyncingGithub(true);
    try {
      // Use the unified AI route for both, or keep /github/sync?
      // Considering the user wants persistence, I'll point to /ai/github-sync
      // because it handles saving the token.
      await axios.post(
        `${BASE_URL}/ai/github-sync`,
        { githubToken: githubToken.trim() },
        { withCredentials: true }
      );
      await refreshUser();
      addToast("GitHub profile synced securely", "success");
      // Don't clear it, it's saved now!
    } catch (error) {
      addToast(error?.response?.data?.message || "GitHub sync failed", "error");
    } finally {
      setSyncingGithub(false);
    }
  };

  const handleAiGithubSync = async () => {
    const githubUrl = formData.socialLinks.github;
    const username = githubUrl ? githubUrl.split("/").pop() : user.githubProfile?.username;
    
    if (!username) {
      addToast("Please provide your GitHub URL or username in profile", "info");
      return;
    }

    setSyncingGithub(true);
    try {
      // Pass the local githubToken state so it can be saved/updated on the backend
      const { data } = await syncGitHubData(username, githubToken.trim());
       setFormData((prev) => ({ ...prev, about: data.data.bio }));
       setSkills(data.data.skills);
      await refreshUser(); // Refresh to see the saved token/stats
      addToast("AI Magic: Your profile is now code-aware!", "success");
    } catch (error) {
      addToast("AI Sync failed. Is the username/token correct?", "error");
    } finally {
      setSyncingGithub(false);
    }
  };

  const missingSkills = useMemo(() => skills.length === 0, [skills.length]);

  return (
    <div className="w-full">
      <div className="mb-8 pl-1">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-neutral-50">Edit Profile</h1>
        <p className="text-sm text-neutral-400">Refine your developer identity and surface the best parts of your story.</p>
      </div>

      <div className="flex flex-col gap-8 xl:flex-row">
        <div className="flex-1 rounded-3xl border border-hairline-soft bg-surface-900 p-6 sm:p-8 shadow-soft">
          <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-brand-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-500">
              <HiCode className="text-lg" />
            </span>
            Profile Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InputField label="First Name" value={formData.firstName} onChange={handleChange("firstName")} />
            <InputField label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} />
            <InputField label="Age" value={formData.age} onChange={handleChange("age")} type="number" />

            <SelectField
              label="Gender"
              value={formData.gender}
              onChange={handleChange("gender")}
              options={[
                { value: "", label: "Select Gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />

            <SelectField
              label="Role"
              value={formData.role}
              onChange={handleChange("role")}
              options={[{ value: "", label: "Select Role" }, ...roleOptions.map((role) => ({ value: role, label: role }))]}
            />

            <InputField
              label="Experience (years)"
              value={formData.experienceYears}
              onChange={handleChange("experienceYears")}
              type="number"
            />

            <SelectField
              label="Availability"
              value={formData.availability}
              onChange={handleChange("availability")}
              options={availabilityOptions}
            />

            <SelectField
              label="Profile Vibe (Theme)"
              value={formData.theme}
              onChange={handleChange("theme")}
              options={themeOptions}
            />

            <InputField
              label="Short Bio / About"
              value={formData.about}
              onChange={handleChange("about")}
              placeholder="I build highly resilient platforms for millions of users..."
              fullWidth
            />

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-neutral-400">
                Skills
              </label>
              <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-xl border border-hairline bg-tint px-3 py-2 transition focus-within:ring-2 focus-within:ring-brand-500/50 hover:bg-tint-strong">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full border border-brand-400/20 bg-brand-500/20 px-2.5 py-1 text-xs font-semibold text-brand-600"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills((prev) => prev.filter((item) => item !== skill))}
                      className="text-brand-600 transition-colors hover:text-brand-500"
                    >
                      <HiX className="text-[12px]" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={missingSkills ? "Add a skill & hit enter..." : "Add more skills"}
                  className="min-w-[140px] flex-1 border-none bg-transparent text-sm text-neutral-50 outline-none"
                  onKeyDown={(event) => {
                    if ((event.key === "Enter" || event.key === ",") && event.currentTarget.value.trim()) {
                      event.preventDefault();
                      const value = event.currentTarget.value.trim();
                      if (!skills.includes(value)) {
                        setSkills((prev) => [...prev, value]);
                      }
                      event.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-hairline-soft pt-8">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-brand-500">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-500">
                <HiCode className="text-lg" />
              </span>
              Social Links
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField 
                label="GitHub URL" 
                value={formData.socialLinks.github} 
                onChange={handleChange("socialLinks", "github")} 
                placeholder="https://github.com/username" 
              />
              <InputField 
                label="LinkedIn URL" 
                value={formData.socialLinks.linkedin} 
                onChange={handleChange("socialLinks", "linkedin")} 
                placeholder="https://linkedin.com/in/username" 
              />
              <InputField 
                label="Portfolio URL" 
                value={formData.socialLinks.portfolio} 
                onChange={handleChange("socialLinks", "portfolio")} 
                placeholder="https://yourportfolio.com" 
                fullWidth
              />
            </div>
          </div>

          {/* ── AI Assistant Panel ── */}
          <AIPanel
            user={user}
            skills={skills}
            formData={formData}
            onBioGenerated={(bio) => setFormData((prev) => ({ ...prev, about: bio }))}
            onSkillsAccepted={(newSkills) => setSkills(newSkills)}
          />

          <div className="mt-8 border-t border-hairline-soft pt-8">
            <div className="mb-4 flex items-center justify-between">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-neutral-400">
                Profile Gallery
              </label>
              {!user.isPremium && (
                <span className="rounded-full bg-accent-orange/10 px-2.5 py-1 text-xs font-semibold text-accent-orange">
                  Premium: 3 photos limit
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {[...Array(user.isPremium ? 3 : 1)].map((_, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedIndex(index);
                    setOpenModal(true);
                  }}
                  className="group relative cursor-pointer"
                >
                  <img
                    src={gallery[index] || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                    alt="profile"
                    className="h-28 w-28 rounded-2xl border-2 border-transparent object-cover transition-colors group-hover:border-brand-400"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-brand-500/90 p-2 text-white">
                      <HiCamera className="text-xl" />
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="absolute -top-3 -right-3 rounded-full border-2 border-surface-900 bg-brand-500 px-2.5 py-0.5 text-[0.65rem] font-bold text-white shadow-brand-glow">
                      MAIN
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={handleLocationUpdate} disabled={updatingLocation}>
              {updatingLocation ? <span className="spinner h-4 w-4 border-2 text-brand-600" /> : "Use Current Location"}
            </Button>
            <Button
              variant="primary"
              onClick={saveProfile}
              disabled={isSaving}
              className="w-full px-8 sm:w-auto"
            >
              {isSaving ? (
                <>
                  <span className="spinner h-4 w-4 border-2 text-brand-600" /> Saving...
                </>
              ) : (
                <>
                  <HiSave className="text-lg" /> Save Changes
                </>
              )}
            </Button>
          </div>

          <div className="mt-10 rounded-2xl border border-hairline-soft bg-tint p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-100">GitHub Integration</p>
                <p className="text-xs text-neutral-400">
                  Paste a personal access token with <span className="font-semibold text-neutral-200">read:user</span> and <span className="font-semibold text-neutral-200">repo</span> scopes to import repositories.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-80">
                <input
                  type="password"
                  value={githubToken}
                  onChange={(event) => setGithubToken(event.target.value)}
                  placeholder="ghp_xxxxxxxxx"
                  className="rounded-xl border border-hairline bg-tint px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                />
                <Button
                  variant="secondary"
                  onClick={handleGithubSync}
                  disabled={syncingGithub}
                  className="justify-center"
                >
                  {syncingGithub ? <span className="spinner h-4 w-4 border-2 text-brand-600" /> : "Token Sync (Full Stats)"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAiGithubSync}
                  disabled={syncingGithub}
                  className="justify-center gap-2 border-none bg-gradient-to-r from-brand-600 to-accent-purple hover:from-brand-500 hover:to-accent-purple"
                >
                  {syncingGithub ? <span className="spinner h-4 w-4 border-2 text-brand-600" /> : <>✨ Magic AI Sync</>}
                </Button>
              </div>
            </div>

            {user.githubProfile?.username && (
              <div className="mt-4 rounded-xl border border-hairline-soft bg-surface-950/60 p-4 text-xs text-neutral-300">
                <p className="text-sm font-semibold text-neutral-100">{user.githubProfile.username}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span>Total Stars: {user.githubProfile.stats?.totalStars ?? 0}</span>
                  <span>Followers: {user.githubProfile.stats?.followers ?? 0}</span>
                </div>
                {user.githubProfile.stats?.topLanguages?.length > 0 && (
                  <div className="mt-2 text-[11px] text-neutral-400">
                    Top Languages: {user.githubProfile.stats.topLanguages.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col pt-2 xl:w-[320px] xl:pt-0">
          <div className="mb-4 self-center text-xs font-semibold uppercase tracking-widest text-neutral-500 xl:self-start xl:pl-2">
            Live Preview
          </div>
          <div className="self-center xl:self-start">
            <UserCardPreview user={{ ...user, ...formData, skills, photoUrl: gallery }} />
          </div>

          <div className="mt-8">
            <div className="mb-4 pl-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              Engagement
            </div>
            <ProfileViews />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 cursor-pointer bg-neutral-950/80 backdrop-blur-sm"
              onClick={() => !isUploading && setOpenModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-sm rounded-3xl border border-hairline bg-surface-900 p-6 shadow-brand-strong"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-50">Upload Photo</h2>
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  disabled={isUploading}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-tint text-neutral-400 transition hover:bg-tint-strong"
                >
                  <HiX className="text-lg" />
                </button>
              </div>

              <label className="flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-400/30 bg-brand-500/5 transition-colors hover:border-brand-400 hover:bg-brand-500/10">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-brand-500">
                  <HiUpload className="text-2xl" />
                </div>
                <span className="text-sm font-medium text-brand-600">Click to choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                />
              </label>

              {selectedFile && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-hairline bg-black/40">
                  <img src={URL.createObjectURL(selectedFile)} alt="preview" className="h-48 w-full object-cover" />
                  <div className="flex items-center justify-center bg-black/60 p-3 text-xs text-white/80">
                    {selectedFile.name}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 justify-center"
                  onClick={() => setOpenModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 justify-center"
                  onClick={uploadImage}
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner h-4 w-4 border-2 text-brand-600" /> Uploading...
                    </>
                  ) : (
                    <>
                      <HiUpload /> Upload
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", placeholder = "", fullWidth }) => (
  <div className={`flex flex-col ${fullWidth ? "sm:col-span-2" : ""}`}>
    <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-neutral-400">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-xl border border-hairline bg-tint px-4 py-3 text-sm text-neutral-50 outline-none transition placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-brand-500/50 hover:bg-tint-strong"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-neutral-400">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full cursor-pointer appearance-none rounded-xl border border-hairline bg-tint px-4 py-3 text-sm text-neutral-50 outline-none transition focus-visible:ring-2 focus-visible:ring-brand-500/50 hover:bg-tint-strong"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-surface-900">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const UserCardPreview = ({ user }) => {
  const images = user.photoUrl || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentTheme = themeStyles[user.theme] || themeStyles["default"];

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 3000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const truncatedSkills = user.skills ? user.skills.slice(0, user.isPremium ? 5 : 3) : [];

  return (
    <motion.div
      className={`relative h-[400px] w-[280px] overflow-hidden rounded-3xl border border-hairline bg-surface-950 ${currentTheme.font}`}
      style={{ boxShadow: currentTheme.shadow }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0">
        {images.length > 0 ? (
          images.map((img, index) => (
            <img
              key={index}
              src={img || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
              alt="preview"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))
        ) : (
          <img
            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
            alt="placeholder"
          />
        )}
      </div>
      <div className="absolute inset-0" style={{ background: currentTheme.gradient }} />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
          {user.firstName || "Developer"} {user.lastName || ""}
          {user.isPremium && <FaCheckCircle className="text-sm text-brand-500" />}
        </h2>
        <div className="mb-3 text-xs font-medium uppercase tracking-wider text-brand-600">
          {user.age && <span>{user.age} yrs</span>}
          {user.age && user.gender && <span className="mx-1.5">•</span>}
          {user.gender && <span>{user.gender}</span>}
          {user.role && (
            <>
              {(user.gender || user.age) && <span className="mx-1.5">•</span>}
              <span>{user.role}</span>
            </>
          )}
        </div>
        <p className="mb-4 line-clamp-2 text-sm text-neutral-300">
          {user.about || "Let's build something ambitious together."}
        </p>
        {truncatedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {truncatedSkills.map((skill) => (
              <span key={skill} className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: currentTheme.badgeBg, color: currentTheme.badgeColor, border: `1px solid ${currentTheme.badgeBorder}`, backdropFilter: "blur(8px)" }}>
                {skill}
              </span>
            ))}
          </div>
        )}
        {user.socialLinks && (Object.values(user.socialLinks).some(v => v)) && (
          <div className="mt-4 flex gap-3 text-neutral-300">
            {user.socialLinks.github && <FaGithub className="text-lg opacity-60 hover:opacity-100 transition-opacity" title="GitHub" />}
            {user.socialLinks.linkedin && <FaLinkedin className="text-lg opacity-60 hover:opacity-100 transition-opacity" title="LinkedIn" />}
            {user.socialLinks.portfolio && <FaGlobe className="text-lg opacity-60 hover:opacity-100 transition-opacity" title="Portfolio" />}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EditProfile;
