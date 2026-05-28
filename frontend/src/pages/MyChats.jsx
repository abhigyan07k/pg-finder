import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import api from "../services/api";
import "../styles/MyChats.css";

function MyChats() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = localStorage.getItem("userId") || user?._id;

  const getRelativeTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const old = new Date(date);
    const diff = Math.floor((now - old) / 1000);

    if (diff < 60) return "Just now";

    const min = Math.floor(diff / 60);
    if (min < 60) return `${min} min ago`;

    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;

    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;

    return old.toLocaleDateString();
  };

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/chat/my-conversations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConversations(res.data.data || []);
    } catch (err) {
      console.log(
        "Fetch conversations error:",
        err.response?.data || err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="my-chats-page">
      <div className="my-chats-container">
        <div className="my-chats-header">
          <h1>My Chats</h1>
          <p>View and continue your property conversations.</p>
        </div>

        {loading ? (
          <div className="chat-list-state">Loading chats...</div>
        ) : conversations.length === 0 ? (
          <div className="chat-list-state">
            <FiMessageSquare />
            <h3>No chats yet</h3>
            <p>Start a chat from any property detail page.</p>
          </div>
        ) : (
          <div className="chat-list">
            {conversations.map((conversation) => {
              const isOwner = conversation.owner?._id === userId;
              const otherUser = isOwner
                ? conversation.renter
                : conversation.owner;
              const image = conversation.property?.images?.[0];

              return (
                <div
                  key={conversation._id}
                  className="chat-list-item"
                  onClick={() => navigate(`/chat/${conversation._id}`)}
                >
                  <img
                    src={image || "/placeholder-property.jpg"}
                    alt={conversation.property?.title || "Property"}
                    className="chat-list-img"
                  />

                  <div className="chat-list-content">
                    <div className="chat-list-top">
                      <h3>{conversation.property?.title || "Property Chat"}</h3>
                      <span>{getRelativeTime(conversation.lastMessageAt)}</span>
                    </div>

                    <p className="chat-person">
                      {isOwner ? "Renter" : "Owner"}:{" "}
                      {otherUser?.name || "User"}
                    </p>

                    <p className="chat-last-message">
                      {conversation.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyChats;
