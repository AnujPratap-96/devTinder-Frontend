import { HiCode, HiHeart } from "react-icons/hi";

const footerLinks = ["Privacy", "Terms", "Support"];

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-surface-900/80 backdrop-blur-xl">
      <div className="content-container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-purple text-base text-neutral-50 shadow-soft">
            <HiCode />
          </span>
          <span className="text-sm font-semibold text-neutral-200">DevTinder</span>
        </div>

        <p className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 text-center">
          © {new Date().getFullYear()} DevTinder. Made with
          <HiHeart className="text-sm text-accent-pink flex-shrink-0" />
          by
          <span className="font-semibold text-brand-200">Anuj Pratap Singh</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-500">
          {footerLinks.map((link) => (
            <button
              type="button"
              key={link}
              className="transition duration-150 ease-snappy hover:text-neutral-200"
            >
              {link}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
