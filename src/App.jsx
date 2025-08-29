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
import {ToastProvider} from "./context/ToastProvider"

const App = () => {
  return (
    <Provider store={appStore}>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes WITHOUT sidebar */}
          <Route path="/" element={<LandingPage />} >
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<OtpVerify />} />
          <Route path= "/complete-signup" element={<Signup />} />
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
          </Route>
        </Routes>
              
      </BrowserRouter>
      </ToastProvider>
    </Provider>
  );
};

export default App;
