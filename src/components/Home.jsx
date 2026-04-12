import clsx from "clsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HiArrowRight,
  HiChat,
  HiCode,
  HiFilter,
  HiGlobe,
  HiLightningBolt,
  HiStar,
} from "react-icons/hi";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { useToast } from "../context/ToastProvider";

const stats = [
  { value: "10K+", label: "Developers" },
  { value: "500+", label: "Projects built" },
  { value: "98%", label: "Match rate" },
];

const features = [
  {
    title: "Swipe & Match",
    description: "Like or skip developers based on skills & interests with fluid swipe gestures.",
    icon: HiLightningBolt,
    accent: "border-warning-400/30 bg-warning-500/10 text-warning-400",
  },
  {
    title: "Chat & Collaborate",
    description: "Real-time messaging and seamless project collaboration with your matches.",
    icon: HiChat,
    accent: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
  },
  {
    title: "Global Dev Hub",
    description: "Connect with brilliant developers worldwide across every timezone.",
    icon: HiGlobe,
    accent: "border-brand-400/30 bg-brand-500/10 text-brand-200",
  },
  {
    title: "Filter by Stack",
    description: "Discover devs by language, framework, experience level, and more.",
    icon: HiFilter,
    accent: "border-success-400/30 bg-success-500/10 text-success-300",
  },
];

const testimonials = [
  {
    name: "Alice Johnson",
    role: "Full Stack Developer",
    text: "DevTinder helped me find a great co-founder for my startup!",
    img: "https://i.pravatar.cc/150?img=10",
  },
  {
    name: "James Smith",
    role: "Backend Engineer",
    text: "I met amazing developers and built two side projects here!",
    img: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Sophia Martinez",
    role: "Open Source Contributor",
    text: "A fantastic platform to collaborate on open-source projects!",
    img: "https://i.pravatar.cc/150?img=20",
  },
  {
    name: "Daniel Brown",
    role: "Mobile Developer",
    text: "I found my dream development team thanks to DevTinder!",
    img: "https://i.pravatar.cc/150?img=25",
  },
];

const devImages = [
  "https://pbs.twimg.com/media/GWs0Mhab0AA8Ocr?format=jpg&name=large",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe-ssOgl7LsDov0e0CoHlRh5KeAsOc1s5SvWm-Zb1IJAlFJBs984P22kfPD9O8EuZickc&usqp=CAU",
  "https://avatars.githubusercontent.com/u/160201596?v=4",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHlDerkPmhtCOzfvbQmPSZOW_QuwexmogYLw&s",
  "https://i.pravatar.cc/150?img=5",
  "https://pbs.twimg.com/profile_images/1828452192107253760/LgHYdkkd_400x400.jpg",
];

const ImageTile = ({ src, delay }) => (
  <motion.div
    whileHover={{ scale: 1.06, rotate: 3 }}
    transition={{ type: "spring", stiffness: 260, damping: 18, delay }}
    className="group relative h-24 w-24 overflow-hidden rounded-2xl border border-brand-400/30 bg-surface-800/80 shadow-soft sm:h-28 sm:w-28"
  >
    <img src={src} alt="Developer" className="h-full w-full object-cover transition duration-300 ease-snappy group-hover:scale-105" />
    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-neutral-950 bg-success-500" />
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const { addToast } = useToast();

  const handleExploreFeed = () => {
    if (!user) {
      addToast("Log in to explore the feed", "info");
      navigate("/login");
      return;
    }
    navigate("/feed");
  };

  return (
    <div className="space-y-24 py-10">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-mesh opacity-60" />
        <div className="absolute -left-40 top-10 -z-10 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-gradient-accent opacity-25 blur-3xl" />

        <div className="content-container grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-8 lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-pill border border-brand-400/40 bg-brand-500/10 px-4 py-1 text-body-xs uppercase tracking-[0.4em] text-brand-200">
              <HiCode className="text-base" /> The Developer Network
            </span>
            <h1 className="text-display-xl font-semibold text-neutral-50">
              Find your perfect <span className="gradient-text">coding partner</span>
            </h1>
            <p className="max-w-xl text-body-lg text-neutral-300">
              Swipe, match, and collaborate with developers worldwide. Build side projects, grow your network, and level up your craft.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                as={motion.button}
                size="lg"
                variant="primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
              >
                Get Started Free <HiArrowRight className="text-lg" />
              </Button>
              <Button
                as={motion.button}
                size="lg"
                variant="secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/register")}
              >
                Create Account
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-4 sm:max-w-md">
              {stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-heading-lg text-neutral-50">{stat.value}</p>
                  <p className="text-body-xs text-neutral-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6 lg:justify-end">
            <div className="grid grid-cols-3 gap-4">
              {devImages.map((src, index) => (
                <ImageTile key={src} src={src} delay={index * 0.05} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="content-container space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-pill border border-brand-400/30 bg-brand-500/10 px-4 py-1 text-body-xs uppercase tracking-[0.3em] text-brand-200">
            <HiCode /> Core features
          </span>
          <h2 className="text-heading-xl text-neutral-50">
            Everything you need to <span className="gradient-text">connect &amp; build</span>
          </h2>
          <p className="mx-auto max-w-2xl text-body-base text-neutral-400">
            DevTinder combines discovery, collaboration, and communication in a single delightful experience so you can ship faster with people you trust.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              as={motion.div}
              key={feature.title}
              tone="muted"
              interactive
              className="flex h-full flex-col gap-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <span className={clsx("flex h-12 w-12 items-center justify-center rounded-2xl border", feature.accent)}>
                <feature.icon className="text-xl" />
              </span>
              <h3 className="text-heading-sm text-neutral-50">{feature.title}</h3>
              <p className="text-body-sm text-neutral-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="content-container space-y-12">
        <div className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-pill border border-warning-400/30 bg-warning-500/10 px-4 py-1 text-body-xs uppercase tracking-[0.3em] text-warning-400">
            <HiStar /> Testimonials
          </span>
          <h2 className="text-heading-xl text-neutral-50">What developers say</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Card
              as={motion.div}
              key={testimonial.name}
              tone="muted"
              interactive
              className="flex h-full flex-col gap-4"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.img}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-2xl border border-brand-400/30 object-cover"
                />
                <div>
                  <p className="text-body-sm font-semibold text-neutral-50">{testimonial.name}</p>
                  <p className="text-body-xs text-neutral-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-1 text-warning-400">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <HiStar key={starIndex} className="text-sm" />
                ))}
              </div>
              <p className="text-body-sm text-neutral-300">“{testimonial.text}”</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="content-container">
        <Card
          as={motion.div}
          tone="accent"
          interactive
          className="relative overflow-hidden text-center"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute inset-0 -z-10 bg-mesh opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/20 via-accent-cyan/10 to-transparent" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 py-12">
            <h2 className="text-heading-xl text-neutral-50">
              Ready to find your <span className="gradient-text">coding soulmate?</span>
            </h2>
            <p className="text-body-base text-neutral-100">
              Join thousands of developers already connecting, collaborating, and building together on DevTinder.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                as={motion.button}
                size="lg"
                variant="primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/register")}
              >
                Join DevTinder
              </Button>
              <Button
                as={motion.button}
                size="lg"
                variant="ghost"
                className="text-neutral-50 hover:text-neutral-100"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleExploreFeed}
              >
                Explore the feed
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Home;
