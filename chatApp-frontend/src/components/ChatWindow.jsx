import { useEffect, useRef, useState } from "react";
import { getMessages, getChatDetails } from "../api/chats";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function ChatWindow({ chat, token }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [chatDetails, setChatDetails] = useState(null);

  const clientRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // --- helper: publish only if connected
  const safePublish = (destination, bodyObj) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({
      destination,
      body: bodyObj !== undefined ? JSON.stringify(bodyObj) : "",
    });
  };

  // --- send DELIVERED for a message (when received)
  const markDelivered = (messageId) => {
    // backend expects payload Long. With stompjs, easiest is a plain string/number body.
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({
      destination: `/app/chats/${chat.id}/delivered`,
      body: String(messageId),
    });
  };

  // --- send READ for a message (when chat is open)
  const markRead = (messageId) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({
      destination: `/app/chats/${chat.id}/read`,
      body: String(messageId),
    });
  };

  // --- typing indicator (throttled)
  const handleTyping = () => {
    const client = clientRef.current;
    if (!client || !client.connected) return;

    // send "typing" event
    client.publish({
      destination: `/app/chats/${chat.id}/typing`,
      body: "",
    });
  };

  useEffect(() => {
    let stompClient;

    async function init() {
    // 1) Load chat details (title + members)
    const details = await getChatDetails(chat.id, token);
    setChatDetails(details);

    // 2) Load history
    const history = await getMessages(chat.id, token);

      // Normalize history into UI-friendly shape
      // Your REST history returns Message entity; sender might be object
      const normalized = (history || []).reverse().map((m) => ({
        id: m.id,
        content: m.content,
        timestamp: m.createdAt || m.timestamp,
        status: m.status || "SENT",
        // display name fallback
        senderName:
          m.sender?.displayName || m.sender?.email || m.sender || "User",
      }));

      setMessages(normalized);

      // 2) Create WS client
      stompClient = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 3000,
        debug: () => {},
        onConnect: () => {
          console.log("Connected to WS");

          // A) Subscribe to new messages
          stompClient.subscribe(`/topic/chats/${chat.id}`, (frame) => {
            const m = JSON.parse(frame.body);

            // m shape from WS:
            // { id, chatId, sender (string), content, timestamp, status }
            const incoming = {
              id: m.id,
              content: m.content,
              timestamp: m.timestamp,
              status: m.status || "SENT",
              senderName: m.sender || "User",
            };

            setMessages((prev) => {
              // avoid duplicates if reconnect or history overlap
              const exists = prev.some((x) => x.id === incoming.id);
              if (exists) return prev;
              return [...prev, incoming];
            });

            // Mark delivered (typically for receiver; MVP marks whenever received)
            if (incoming.id) markDelivered(incoming.id);
          });

          // B) Subscribe to status updates (JSON now)
          stompClient.subscribe(`/topic/chats/${chat.id}/status`, (frame) => {
            // backend sends: { messageId: 123, status: "READ" }
            const payload = JSON.parse(frame.body);
            const messageId = Number(payload.messageId);
            const status = payload.status;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === messageId ? { ...m, status } : m
              )
            );
          });

          // C) Subscribe to typing (optional)
          stompClient.subscribe(`/topic/chats/${chat.id}/typing`, (frame) => {
            const who = frame.body; // backend sends userId currently
            setTypingUser(who);

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setTypingUser(null);
            }, 1500);
          });

          // D) When chat opens, mark existing messages as READ (MVP: mark all)
          // In real app, only mark messages not sent by me.
          setTimeout(() => {
            setMessages((prev) => {
              prev.forEach((m) => {
                if (m.id && m.status !== "READ") markRead(m.id);
              });
              return prev;
            });
          }, 300);
        },
      });

      stompClient.activate();
      clientRef.current = stompClient;
    }

    init();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (clientRef.current) clientRef.current.deactivate();
    };
  }, [chat.id, token]); // include token too

  const send = () => {
    const client = clientRef.current;

    if (!client || !client.connected) {
      console.log("Socket not connected yet");
      return;
    }
    if (!text.trim()) return;

    client.publish({
      destination: `/app/chats/${chat.id}/send`,
      body: JSON.stringify({ content: text }),
    });

    setText("");
  };

  return (
    <div>
      {chatDetails && (
        <div
            style={{
            padding: 10,
            borderBottom: "1px solid #444",
            marginBottom: 10,
            }}
        >
            <h3 style={{ margin: 0 }}>{chatDetails.displayTitle}</h3>

            {chatDetails.type === "GROUP" && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
                Members:{" "}
                {chatDetails.members.map((m) => m.displayName).join(", ")}
            </div>
            )}

            {chatDetails.type === "DIRECT" && (
            <div style={{ fontSize: 12, opacity: 0.7 }}>
                Direct chat
            </div>
            )}
        </div>
        )}

      <div style={{ height: 300, overflowY: "scroll", border: "1px solid #ccc", padding: 8 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div>
              <b>{m.senderName}:</b> {m.content}
            </div>
            <small>
              {m.timestamp ? m.timestamp : ""}
              {"  "}
              {m.status ? `• ${m.status}` : ""}
            </small>
          </div>
        ))}
      </div>

      {typingUser && chatDetails && (
  <div style={{ marginTop: 6, fontSize: 12 }}>
    {chatDetails.type === "DIRECT"
      ? "Typing..."
      : "Someone is typing..."}
  </div>
)}

      <div style={{ marginTop: 10 }}>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
        />
        <button onClick={send} style={{ marginLeft: 8 }}>
          Send
        </button>
      </div>
    </div>
  );
}