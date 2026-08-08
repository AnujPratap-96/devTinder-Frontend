import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./context/ThemeProvider";
import appStore from "./store/appStore";
import Body from "./components/Body";
import LandingPage from "./components/LandingPage";
import Home from "./components/Home";
import Login from "./components/Login";
import MatchCelebration from "./components/MatchCelebration";
import { ToastProvider } from "./context/ToastProvider";
import { CallProvider } from "./components/call/CallProvider";

// ── Route-level code splitting (heavy pages load on demand only)
const Feed = lazy(() => import("./components/Feed"));
const Profile = lazy(() => import("./components/Profile"));
const Connections = lazy(() => import("./components/Connections"));
const Requests = lazy(() => import("./components/Requests"));
const Premium = lazy(() => import("./components/Premium"));
const Messages = lazy(() => import("./components/Messages"));
const ChatBox = lazy(() => import("./components/ChatBox"));
const Register = lazy(() => import("./components/Register"));
const Signup = lazy(() => import("./components/Signup"));
const OtpVerify = lazy(() => import("./components/Otp"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Projects = lazy(() => import("./components/Projects"));
const Bookmarks = lazy(() => import("./components/Bookmarks"));
const InviteFriends = lazy(() => import("./components/InviteFriends"));
const Settings = lazy(() => import("./components/Settings")); // [PHASE-3] security & privacy
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers"));
const AdminReports = lazy(() => import("./components/admin/AdminReports"));
const AdminBanned = lazy(() => import("./components/admin/AdminBanned"));
const AdminPlans = lazy(() => import("./components/admin/AdminPlans"));

const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <span className="block h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
  </div>
);

const App = () => {
  return (
    <Provider store={appStore}>
      <ThemeProvider>
        <ToastProvider>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <CallProvider>
              <div className="layout-shell bg-mesh">
                <Suspense fallback={<PageFallback />}>
                <Routes>
              {/* Routes WITHOUT sidebar */}
              <Route path="/" element={<LandingPage />}>
                <Route index element={<Home />} />
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
                    <Route path="/invite-friends" element={<InviteFriends />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="users" replace />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="banned" element={<AdminBanned />} />
                      <Route path="plans" element={<AdminPlans />} />
                    </Route>
                  </Route>
                </Routes>
                </Suspense>
              </div>
              <MatchCelebration />
              </CallProvider>
            </BrowserRouter>
          </MotionConfig>
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
