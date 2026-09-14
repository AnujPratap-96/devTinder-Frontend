import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./context/ThemeProvider";
import appStore from "./store/appStore";
import Body from "./layouts/Body";
import LandingPage from "./layouts/LandingPage";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import MatchCelebration from "./components/common/MatchCelebration";
import { ToastProvider } from "./context/ToastProvider";
import { CallProvider } from "./features/call/components/CallProvider";

// ── Route-level code splitting (heavy pages load on demand only)
const Feed = lazy(() => import("./pages/Feed"));
const Profile = lazy(() => import("./pages/Profile"));
const Connections = lazy(() => import("./pages/Connections"));
const Requests = lazy(() => import("./pages/Requests"));
const Premium = lazy(() => import("./pages/Premium"));
const Messages = lazy(() => import("./pages/Messages"));
const ChatBox = lazy(() => import("./pages/ChatBox"));
const Register = lazy(() => import("./pages/auth/Register"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const OtpVerify = lazy(() => import("./pages/auth/Otp"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Projects = lazy(() => import("./pages/Projects"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const InviteFriends = lazy(() => import("./pages/InviteFriends"));
const Settings = lazy(() => import("./pages/Settings")); // [PHASE-3] security & privacy
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminBanned = lazy(() => import("./pages/admin/AdminBanned"));
const AdminPlans = lazy(() => import("./pages/admin/AdminPlans"));

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
