import { useNavigate } from "react-router-dom";
import useConnectionList from "../hooks/useConnectionList";

const Messages = () => {
  const connections = useConnectionList();
  const navigate = useNavigate();

  return (
    <div className="w-full border-r border-gray-700 p-5 bg-gray-900 h-full shadow-lg rounded-lg flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold text-gray-200 mb-4 border-b border-gray-700 pb-2 text-center w-full">
        Connections
      </h2>

      {connections?.length > 0 ? (
        <ul className="space-y-3 flex flex-col items-center w-full">
          {connections.map((conn) => (
            <li
              key={conn._id}
              className="p-4 cursor-pointer bg-gray-800 shadow-md hover:bg-gray-700 rounded-lg transition duration-200 ease-in-out w-3/4 text-center"
              onClick={() => navigate(`/chat/${conn._id}`)}
            >
              <p className="text-lg font-medium text-gray-300">
                {conn.firstName} {conn.lastName}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-center mt-4">No connections found</p>
      )}
    </div>
  );
};

export default Messages;
