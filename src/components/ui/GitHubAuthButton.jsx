import { FaGithub } from "react-icons/fa";
import { useToast } from "../../context/ToastProvider";

const GitHubAuthButton = ({ text = "Continue with GitHub" }) => {
  const { addToast } = useToast();
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;

  const handleGitHubClick = () => {
    if (!clientId) {
      addToast("GitHub OAuth is not configured. Set VITE_GITHUB_CLIENT_ID in your frontend .env file.", "error");
      return;
    }
    const redirectUri = `${window.location.origin}/login`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
    window.location.href = githubAuthUrl;
  };

  return (
    <button
      type="button"
      onClick={handleGitHubClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-hairline bg-surface-800/80 px-4 py-3 text-sm font-semibold text-neutral-100 shadow-soft backdrop-blur-md transition-all hover:bg-surface-800 hover:border-hairline-strong active:scale-[0.99]"
    >
      <FaGithub className="text-lg text-neutral-100" />
      <span>{text}</span>
    </button>
  );
};

export default GitHubAuthButton;
