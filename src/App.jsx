import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import appStore from "./store/appStore";
import Home from "./components/Home";
import Body from "./components/Body";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Connections from "./components/Connections";
import Feed from "./components/Feed";
import Requests from "./components/Requests";
import Premium from "./components/Premium";
import ChatBox from "./components/ChatBox";
import Messages from "./components/Messages";
import Register from "./components/Register";
import Signup from "./components/Signup";
import OtpVerify from "./components/Otp";
import ForgotPassword from "./components/ForgotPassword";
import { ToastProvider } from "./context/ToastProvider";
import Projects from "./components/Projects";
import Bookmarks from "./components/Bookmarks";
import AdminDashboard from "./components/AdminDashboard";

const App = () => {
  return (
    <Provider store={appStore}>
      <ToastProvider>
        <BrowserRouter>
          <div className="layout-shell bg-mesh">
            <Routes>
              {/* Routes WITHOUT sidebar */}
              <Route path="/" element={<LandingPage />}>
<Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<OtpVerify />} />
                <Route path="/complete-signup" element={<Signup />} />
              </Route>

              {/* Routes WITH sidebar wrapped inside Body */}
              <Route element={<Body />}>
                <Route path="/feed" element={<Feed />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/chat/:targetUserId" element={<ChatBox />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
};

export default App;
