import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addFeed } from "../store/feedSlice";
import UserCard from "./UserCard";
import {toast } from "react-hot-toast";

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);

  const getFeed = async () => {
    if (feed.length > 0) return; // Prevent unnecessary API calls
    try {
      const res = await axios.get(BASE_URL + "/user/feed", { withCredentials: true });
      dispatch(addFeed(res?.data?.users || [])); // Ensure data is valid
    } catch (err) {
      toast.error( err.message ||"Error fetching feed. Please try again later.");
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-gray-900 text-white">
      {feed.length > 0 ? (
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          <UserCard key={feed[0]._id} user={feed[0]} />
        </div>
      ) : (
        <p className="text-gray-400 text-lg">No users found...</p>
      )}
    </div>
  );
};

export default Feed;
