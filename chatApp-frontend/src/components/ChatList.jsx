import { useEffect, useState } from "react";
import { getChats } from "../api/chats";

export default function ChatList({ token, setActiveChat }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await getChats(token);
      setChats(data);
    }
    load();
  }, [token]);

  return (
  <div>
    <h3>Your Chats</h3>

    {chats.map((chat) => (
      <div
        key={chat.id}
        onClick={() => setActiveChat(chat)}
        style={{
          padding: 10,
          border: "1px solid #444",
          borderRadius: 8,
          marginBottom: 8,
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        <div style={{ fontWeight: "bold" }}>
          {chat.displayTitle}
        </div>

        <div style={{ fontSize: 12, opacity: 0.6 }}>
          {chat.type === "DIRECT" ? "Direct Chat" : "Group Chat"}
        </div>
      </div>
    ))}
  </div>
);
}