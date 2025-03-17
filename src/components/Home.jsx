/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";



const ImageComponent = ({ src, alt }) => (
  <motion.img
    className="w-36 h-36 rounded-full shadow-xl border-4 border-blue-400 transition-transform duration-300 hover:shadow-2xl object-contain object-center"
    src={src}
    alt={alt}
    whileHover={{ scale: 1.2, rotate: 5 }}
  />
);


const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-900  text-white min-h-screen flex flex-col items-center px-6 pb-5">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col md:flex-row items-center justify-between px-8 mt-3"
      >
        {/* Text Section */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight">
            Find Your Perfect{" "}
            <span className="text-blue-400">Coding Partner!</span>
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-xl leading-relaxed">
            Swipe, match, and collaborate with developers worldwide. Build
            projects, grow your network, and level up your coding game!
          </p>
          <div className="mt-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-2 text-lg font-semibold shadow-lg rounded-full transition-all"
              onClick={() => navigate("/login")}
            >
              Get Started
            </motion.button>
          </div>
        </div>

        {/* Image Section */}
        <div className="md:w-1/2 flex justify-center mt-12 md:mt-0">
        <div className="grid grid-cols-3 gap-4">
            {/* Six defined images */}
            <ImageComponent
              src="https://pbs.twimg.com/media/GWs0Mhab0AA8Ocr?format=jpg&name=large"
              alt="User 1"
            />
            <ImageComponent
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQe-ssOgl7LsDov0e0CoHlRh5KeAsOc1s5SvWm-Zb1IJAlFJBs984P22kfPD9O8EuZickc&usqp=CAU"
              alt="User 2"
            />
            <ImageComponent
              src="https://avatars.githubusercontent.com/u/160201596?v=4"
            />
            <ImageComponent
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHlDerkPmhtCOzfvbQmPSZOW_QuwexmogYLw&s"
            />
            <ImageComponent
              src="https://i.pravatar.cc/150?img=5"
              alt="User 5"
            />
            {/* Custom image */}
            <ImageComponent
              src="https://yt3.googleusercontent.com/vLLYSMUqgq8v8lNVFodiBTrvDZJvTPYkDATk0LxPcYQcZVCqHvca499gj2ZkdroX3LfJtWg5=s900-c-k-c0x00ffffff-no-rj"
              alt="Shradha Khapra"
            />
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <div className="mt-24 grid md:grid-cols-2 gap-8 text-center">
        {[
          {
            title: "🚀 Swipe & Match",
            text: "Like or skip developers based on skills & interests.",
          },
          {
            title: "💬 Chat & Collaborate",
            text: "Instant messaging and project collaboration.",
          },
          {
            title: "🌍 Global Developer Hub",
            text: "Connect with devs worldwide.",
          },
          {
            title: "🔍 Filter by Tech Stack",
            text: "Find devs based on language, framework, and experience.",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.2)",
            }}
            className="p-6 bg-gray-800 rounded-2xl shadow-lg transition-transform transform hover:-translate-y-1"
          >
            <h2 className="text-2xl font-semibold text-blue-400">
              {feature.title}
            </h2>
            <p className="mt-2 text-gray-300">{feature.text}</p>
          </motion.div>
        ))}
      </div>

      {/* Testimonials Section */}
      <div className="mt-24 text-center max-w-3xl">
        <h2 className="text-3xl font-bold text-blue-400">
          What Developers Say
        </h2>
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {[
            {
              name: "Alice Johnson",
              text: "DevTinder helped me find a great co-founder for my startup!",
              img: "https://i.pravatar.cc/150?img=10",
            },
            {
              name: "James Smith",
              text: "I met amazing developers and built two side projects here!",
              img: "https://i.pravatar.cc/150?img=12",
            },
            {
              name: "Sophia Martinez",
              text: "A fantastic platform to collaborate on open-source projects!",
              img: "https://i.pravatar.cc/150?img=20",
            },
            {
              name: "Daniel Brown",
              text: "I found my dream development team thanks to DevTinder!",
              img: "https://i.pravatar.cc/150?img=25",
            },
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
              }}
              className="p-6 bg-gray-800 rounded-2xl shadow-lg flex items-center gap-4 transition-transform transform hover:-translate-y-1"
            >
              <img
                src={review.img}
                className="w-16 h-16 rounded-full border-4 border-blue-400"
                alt={review.name}
              />
              <div className="text-left">
                <h3 className="text-lg font-semibold">{review.name}</h3>
                <p className="text-gray-300">{review.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Call to Action */}
      <div className="mt-20 text-center mb-5">
        <h2 className="text-4xl font-bold tracking-wide">
          Ready to Find Your Coding Partner?
        </h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg font-semibold shadow-lg rounded-full transition-all mt-6"
          onClick={() => navigate("/login")}
        >
          Join Now
        </motion.button>
      </div>
      {/* Footer */}
    </div>
  );
};

export default LandingPage;
