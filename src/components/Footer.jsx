import { HiCode, HiHeart } from "react-icons/hi";

const footerLinks = ["Privacy", "Terms", "Support"];

const Footer = () => {
  return (
    <footer className="px-3 pb-3 pt-2 sm:px-4">
      <div className="glass mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 rounded-2xl border-hairline px-5 py-4 sm:flex-row sm:py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-accent-purple text-base text-on-accent shadow-soft">
            <HiCode />
          </span>
          <span className="text-sm font-semibold text-neutral-200">DevTinder</span>
        </div>

        <p className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-500 text-center">
          © {new Date().getFullYear()} DevTinder. Made with
          <HiHeart className="text-sm text-accent-pink flex-shrink-0" />
          by
          <span className="font-semibold text-brand-600">Anuj Pratap Singh</span>
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
