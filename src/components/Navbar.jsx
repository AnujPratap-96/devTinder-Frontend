import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../store/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useState } from "react";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickHome = () => {
    navigate(user ? "/feed" : "/");
  };

  return (
    <nav className="bg-gray-900  sticky w-full shadow-lg px-6 py-3 flex items-center justify-between z-50 top-0">
      {/* Add top-0 to ensure it's at the top */}
      {/* Left Section */}
      <button
        className=" btn btn-outline text-2xl font-bold text-blue-400 flex items-center gap-2"
        onClick={handleClickHome}
      >
        👩‍💻 DevTinder
      </button>

      {/* Hamburger Menu (Only visible for width < 500px) */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white text-2xl"
        >
          {isMenuOpen ? "✖️" : "☰"}
        </button>
      </div>

      {/* Right Section (Desktop) */}
      <div className="hidden sm:flex items-center gap-4">
        {user ? (
          <>
            <span className="text-white font-medium text-lg">
              Welcome <span className="text-cyan-300">{user.firstName}</span>
            </span>

            {/* User dropdown */}
            <div className="relative group">
              <div className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full object-center">
                  <img
                    alt={`${user?.firstName || "User"}'s profile`}
                    src={
                      user.photoUrl ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                  />
                </div>
              </div>
              <ul className="absolute right-0 hidden group-hover:block menu bg-gray-800 rounded-lg p-2 shadow-lg mt-2 w-44 text-white z-50">
                {/* Ensure the dropdown has z-50 */}
                <li>
                  <Link
                    to={"/profile"}
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <button
            className=" btn btn-outline text-2xl font-bold text-blue-400 flex items-center gap-2"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile Menu (Dropdown) */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-900 sm:hidden flex flex-col items-center py-4 space-y-3 shadow-lg z-50">
          {/* Ensure z-50 to appear above other content */}
          {user ? (
            <>
              <span className="text-white font-medium text-lg">
                {user.firstName}
              </span>
              <Link to={"/profile"} className="text-white hover:text-blue-400">
                Profile
              </Link>
              <button className="text-white hover:text-blue-400">
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-300 shadow-md"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
