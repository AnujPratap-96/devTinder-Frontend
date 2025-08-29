import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../store/requestsSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);
const {addToast} = useToast();
  // Fetch connection requests
  const connectionRequest = async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", { withCredentials: true });
      dispatch(addRequests(res?.data?.requests));
    } catch (error) {
      addToast(error?.response?.data?.message || "Error fetching requests. Please try again later.")

    }
  };

  // Accept or reject request
  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(BASE_URL + "/request/review/" + status + "/" + _id, {}, { withCredentials: true });
      dispatch(removeRequest(_id));
    } catch (error) {
      addToast(error?.response?.data?.message ||"Error updating request status. Please try again later." , "error")

    }
  };


  useEffect(() => {
    connectionRequest();
  }, []);



  return (
    <div className="flex flex-col gap-8 p-6 items-center bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-extrabold mb-8 text-center">Pending Connection Requests</h1>
      {requests?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {requests?.map((request) => {
            if (!request.fromUserId) return null; // Skip if fromUserId is not populated
            const { firstName, lastName, photoUrl, age, gender, about, skills } = request.fromUserId;
            return (
              <div
                key={request._id}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-800 shadow-lg hover:shadow-2xl transition duration-300 w-full min-h-[350px] max-h-[400px]"
              >
                {/* User Image */}
                <img
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-lg object-cover mb-3"
                  src={photoUrl[0] || "https://via.placeholder.com/150"}
                />

                {/* User Info */}
                <h2 className="font-bold text-lg">{firstName + " " + lastName}</h2>

                {/* About Section (Limited to Two Lines) */}
                <p className="text-gray-400 mt-1 text-sm line-clamp-2 overflow-hidden">
                  {about || "No bio provided."}
                </p>

                {age && gender && (
                  <p className="text-gray-500 text-sm mt-1">{age} years old, {gender}</p>
                )}

                {/* Skills in Row */}
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {(skills?.slice(0, 3) || []).map((skill, index) => (
                    <span key={index} className="btn btn-outline text-blue-600 px-2 py-1 text-xs rounded-md font-bold">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 w-full">
                  <button
                    onClick={() => reviewRequest("accepted", request._id)}
                    className="btn btn-outline px-4 py-2  text-green-500 rounded-lg hover:bg-green-600 transition duration-200 w-1/2 font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => reviewRequest("rejected", request._id)}
                    className="btn btn-outline px-4 py-2 text-red-400 rounded-lg hover:bg-red-600 transition duration-200 w-1/2 font-semibold"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-lg text-gray-500">No connection requests found.</p>
      )}
    </div>
  );
};

export default Requests;
