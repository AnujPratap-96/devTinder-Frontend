import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-900">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 p-5 flex justify-center">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </div>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}

export default Layout;