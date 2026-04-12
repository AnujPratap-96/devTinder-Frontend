import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="layout-shell bg-mesh">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <div className="content-container w-full py-10 lg:py-16">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
