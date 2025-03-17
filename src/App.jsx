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
const App = () => {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          {/* Routes WITHOUT sidebar */}
          <Route path="/" element={<LandingPage />} >
          <Route path="/" element= {<Home/>} />
          <Route path="/login" element={<Login />} />
          </Route>

          {/* Routes WITH sidebar wrapped inside Body */}
          <Route element={<Body />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/premium" element={<Premium/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
