import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import "../styles/ChatPage.css";

function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = localStorage.getItem("userId") || user?._id;

  const getRelativeTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = Math.floor((now - msgDate) / 1000);

    if (diff < 60) return "Just now";

    const min = Math.floor(diff / 60);
    if (min < 60) return `${min} min ago`;

    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr ago`;

    const day = Math.floor(hr / 24);
    if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;

    return msgDate.toLocaleDateString();
  };

  const fetchConversation = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get(`/chat/conversation/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setConversation(res.data.data);
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");

    const res = await api.get(`/chat/messages/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMessages(res.data.data || []);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      setSending(true);

      const token = localStorage.getItem("token");

      await api.post(
        `/chat/send/${conversationId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setText("");
    } catch (err) {
      console.log("Send message error:", err.response?.data || err.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // console.log("ChatPage mounted");
    // console.log("conversationId:", conversationId);

    const init = async () => {
      try {
        setLoading(true);
        setError("");
        await fetchConversation();
        await fetchMessages();
      } catch (err) {
        console.log("Chat load error:", err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Failed to load chat",
        );
      } finally {
        // console.log("Loading false");
        setLoading(false);
      }
    };

    if (conversationId) {
      init();
    } else {
      setError("Conversation ID missing");
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    socketRef.current = socket;
    socket.emit("join", userId);
    socket.on("receiveMessage", (newMessage) => {
      if (newMessage.conversation === conversationId) {
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) => msg._id === newMessage._id);
          if (alreadyExists) return prev;
          return [...prev, newMessage];
        });
      }
    });

    socket.on("messageSent", (newMessage) => {
      if (newMessage.conversation === conversationId) {
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) => msg._id === newMessage._id);
          if (alreadyExists) return prev;
          return [...prev, newMessage];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, userId]);

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-card">
          <div className="chat-empty">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-page">
        <div className="chat-card">
          <div className="chat-empty">
            <h3>Chat failed to load</h3>
            <p>{error}</p>
            <button onClick={() => navigate("/my-chats")}>Back to Chats</button>
          </div>
        </div>
      </div>
    );
  }

  const property = conversation?.property;
  const otherUser =
    conversation?.owner?._id === userId
      ? conversation?.renter
      : conversation?.owner;

  return (
    <div className="chat-page">
      <div className="chat-card">
        <div className="chat-header">
          <button className="chat-back-btn" onClick={() => navigate(-1)}>
            ←
          </button>

          <img
            src={property?.images?.[0] || "/placeholder-property.jpg"}
            alt={property?.title || "Property"}
            className="chat-property-img"
          />

          <div className="chat-header-info">
            <h3>{property?.title || "Property Chat"}</h3>
            <p>
              Chat with {otherUser?.name || "User"} • ₹
              {property?.price || "N/A"}
            </p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              No messages yet. Start the conversation.
            </div>
          ) : (
            messages.map((msg) => {
              const senderId =
                typeof msg.sender === "object" ? msg.sender._id : msg.sender;

              const isMine = senderId === userId;

              return (
                <div
                  key={msg._id}
                  className={`chat-message-row ${isMine ? "mine" : "other"}`}
                >
                  <div className="chat-bubble">
                    <p>{msg.text}</p>
                    <span className="chat-time">
                      {getRelativeTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef}></div>
        </div>

        <form className="chat-input-area" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            type="submit"
            className="chat-send-btn"
            disabled={sending || !text.trim()}
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
