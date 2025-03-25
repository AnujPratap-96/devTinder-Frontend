/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai"; // Import arrow icon
import { BASE_URL, createSocketConnection } from "../utils/constant";
import axios from "axios";

const ChatBox = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate(); // For navigating back
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null); // State to store errors
  const messagesEndRef = useRef(null);
  const Connection = useSelector((state) => state.connections);
  const otherUser = Connection?.find((conn) => conn._id === targetUserId);
  const user = useSelector((state) => state.user);
  const userId = user?._id;

  const fetchChat = async () => {
    try {
      const response = await axios.get(BASE_URL + `/chat/${targetUserId}`, {
        withCredentials: true,
      });

      const chatMessages = response?.data.chat.messages.map((msg) => ({
        text: msg.text,
        sender: msg.senderId === userId ? "me" : "other",
      }));

      setMessages(chatMessages);
      setError(null); // Reset error state if request succeeds
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    fetchChat();
  }, [targetUserId]);

  useEffect(() => {
    if (!userId || !targetUserId) return;
    const socket = createSocketConnection();
    socket.emit("joinChat", { userId, targetUserId });

    socket.on("messageReceived", ({ userId, text }) => {
      setMessages((messages) => [
        ...messages,
        { text, sender: userId === targetUserId ? "other" : "me" },
      ]);
    });
    socket.on("error" , (data)=>{
      setError(data.message);
    })

    return () => {
      socket.off("messageReceived");
      socket.off("error");
      socket.disconnect();
    };
  }, [userId, targetUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const socket = createSocketConnection();
    if (!input.trim()) return;
    setInput("");

    socket.emit("sendMessage", { userId, targetUserId, text: input });
  };

  // If there is an error, show the error message instead of the chat box
  if (error) {
    return (
      <div className="w-full h-[90vh] flex items-center justify-center bg-gray-800 text-red-400 text-lg font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-full h-[90vh] flex flex-col bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-gray-300 text-lg font-semibold p-4 border-b border-gray-700 flex items-center gap-3">
        <AiOutlineArrowLeft
          className="text-xl cursor-pointer hover:text-gray-400 transition"
          onClick={() => navigate("/messages")}
        />
        Chat with {otherUser?.firstName} {otherUser?.lastName}
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 max-w-full p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
        style={{ maxHeight: "70vh" }}
        ref={messagesEndRef}
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            Start a conversation...
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 max-w-xs md:max-w-sm lg:max-w-md text-sm rounded-xl shadow-md ${
                  msg.sender === "me"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-700 text-gray-300 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-3 m-1 border-t border-gray-700 bg-gray-800 flex items-center gap-2 rounded-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 bg-gray-700 text-gray-300 rounded-lg focus:outline-none placeholder-gray-400"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
