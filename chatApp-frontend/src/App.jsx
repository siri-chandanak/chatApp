import { useState } from "react";
import Login from "./components/Login";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import CreateChat from "./components/CreateChat";
import Profile from "./components/Profile";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [activeChat, setActiveChat] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!token) return <Login setToken={setToken} />;

  const logout = () => {
  localStorage.removeItem("token");
  setToken(null);
};

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      <Profile token={token} onLogout={logout} />
      <div style={{ width: 320 }}>
        <CreateChat
          token={token}
          onCreated={(chat) => {
            setActiveChat(chat);
            setRefreshKey((k) => k + 1); // force refresh chat list
          }}
        />
        <div style={{ marginTop: 16 }}>
          <ChatList
            key={refreshKey}
            token={token}
            setActiveChat={setActiveChat}
          />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {activeChat ? (
          <ChatWindow chat={activeChat} token={token} />
        ) : (
          <div>Select a chat</div>
        )}
      </div>
    </div>
  );
}

export default App;