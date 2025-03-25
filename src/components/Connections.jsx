import useConnectionList from "../hooks/useConnectionList";

const Connections = () => {

  const connections = useConnectionList();

  return (
    <div className="w-full flex flex-col items-center p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="font-extrabold text-3xl mb-6 text-center">Connections</h1>

      {connections?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {connections.map((connection, index) => {
            const { firstName, lastName, photoUrl, age, gender, about, skills } = connection;
            
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-800 shadow-lg hover:shadow-xl transition duration-300 w-full min-h-[250px] max-h-[320px]"
              >
                {/* Profile Image */}
                <img
                  alt="profile"
                  className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-md object-cover mb-3"
                  src={photoUrl || "https://via.placeholder.com/150"}
                />

                {/* Name */}
                <h2 className="font-bold text-lg">{firstName + " " + lastName}</h2>

                {/* Age & Gender */}
                {age && gender && (
                  <p className="text-gray-400 text-sm mt-1">{age} years old, {gender}</p>
                )}

                {/* About (Limited to 2 lines) */}
                <p className="text-gray-400 mt-2 text-sm line-clamp-2 overflow-hidden">
                  {about || "No bio provided."}
                </p>

                {/* Skills (Max 3) */}
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {(skills?.slice(0, 3) || []).map((skill, index) => (
                    <span key={index} className="bg-blue-600 px-2 py-1 text-xs rounded-md text-white">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <h2 className="text-gray-500 text-xl mt-20">No Connections Found</h2>
      )}
    </div>
  );
};

export default Connections;
