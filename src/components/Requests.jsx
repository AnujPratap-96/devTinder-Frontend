import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeRequest } from "../store/requestsSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useToast } from "../context/ToastProvider";
import { motion } from "framer-motion";
import { HiCheck, HiX, HiBell, HiCode } from "react-icons/hi";
import Button from "./ui/Button";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests);
  const { addToast } = useToast();

  const connectionRequest = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL + "/user/requests/received", { withCredentials: true });
       dispatch(addRequests(res?.data?.data || []));
    } catch (error) {
      addToast(error?.response?.data?.message || "Error fetching requests. Please try again later.");
    }
  }, [dispatch, addToast]);

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(BASE_URL + "/request/review/" + status + "/" + _id, {}, { withCredentials: true });
      dispatch(removeRequest(_id));
      addToast(status === "accepted" ? "Connection accepted! 🎉" : "Request rejected", status === "accepted" ? "success" : "info");
    } catch (error) {
      addToast(error?.response?.data?.message || "Error updating request status.", "error");
    }
  };

  useEffect(() => {
    connectionRequest();
  }, [connectionRequest]);

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-heading-md text-neutral-50">Connection Requests</h1>
        <p className="mt-1 text-body-sm text-neutral-400">
          {requests?.length > 0
            ? `${requests.length} pending request${requests.length !== 1 ? "s" : ""}`
            : "No pending requests"}
        </p>
      </div>

      {requests?.length > 0 ? (
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${requests.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2 max-w-4xl mx-auto'}`}>
          {requests?.map((request, index) => {
            if (!request.fromUserId) return null;
            const { firstName, lastName, photoUrl, age, gender, about, skills } = request.fromUserId;

            return (
              <Card
                as={motion.div}
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                whileHover={{ y: -4, scale: 1.01 }}
                tone="muted"
                padding="md"
                interactive
                className="flex h-full flex-col gap-4"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3">
                  <div className="avatar-ring h-14 w-14 overflow-hidden">
                    <img
                      alt={`${firstName}'s profile`}
                      className="h-full w-full object-cover"
                      src={photoUrl?.[0] || "https://via.placeholder.com/150"}
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-body-sm font-semibold text-neutral-50">
                      {firstName} {lastName}
                    </h2>
                    {age && gender && (
                      <p className="mt-0.5 text-body-xs text-neutral-400">
                        {age} · {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-warning-400/30 bg-warning-500/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-warning-400">
                      <HiBell className="text-sm" /> Wants to connect
                    </div>
                  </div>
                </div>

                {/* About */}
                {about && (
                  <p className="line-clamp-3 text-body-xs leading-relaxed text-neutral-300">
                    {about}
                  </p>
                )}

                {/* Skills */}
                {skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded-pill border border-brand-400/30 bg-brand-500/10 px-2.5 py-1 text-[0.7rem] font-medium text-brand-100">
                        <HiCode className="text-sm text-brand-200" /> {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <Button
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    variant="success"
                    size="sm"
                    className="flex-1"
                    type="button"
                    onClick={() => reviewRequest("accepted", request._id)}
                  >
                    <HiCheck className="text-base" /> Accept
                  </Button>
                  <Button
                    as={motion.button}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    type="button"
                    onClick={() => reviewRequest("rejected", request._id)}
                  >
                    <HiX className="text-base" /> Decline
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md"
        >
          <EmptyState
            icon={<HiBell className="text-3xl" />}
            title="No pending requests"
            description="When other developers want to connect with you, their requests will appear here."
            tone="translucent"
            action={
              <Button variant="secondary" size="sm" onClick={connectionRequest}>
                Refresh requests
              </Button>
            }
          />
        </motion.div>
      )}
    </div>
  );
};

export default Requests;
