import { useState } from "react";
import { createDirectChat, createGroupChat } from "../api/chats";
import UserPicker from "./UserPicker";

export default function CreateChat({ token, onCreated }) {
  const [directSelected, setDirectSelected] = useState([]); // single user
  const [groupSelected, setGroupSelected] = useState([]);   // multiple users
  const [groupTitle, setGroupTitle] = useState("");

  const createDirect = async () => {
    if (directSelected.length !== 1) return alert("Select exactly 1 user for direct chat");
    const otherUserId = directSelected[0].id;
    const chat = await createDirectChat(otherUserId, token);
    onCreated(chat);
    setDirectSelected([]);
  };

  const createGroup = async () => {
    if (!groupTitle.trim()) return alert("Enter group title");
    if (groupSelected.length < 2) return alert("Select at least 2 users for group chat");
    const ids = groupSelected.map((u) => u.id);
    const chat = await createGroupChat(groupTitle.trim(), ids, token);
    onCreated(chat);
    setGroupTitle("");
    setGroupSelected([]);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <h3>Direct Chat</h3>
        <UserPicker
          token={token}
          selected={directSelected}
          setSelected={setDirectSelected}
          multi={false}
        />
        <button onClick={createDirect} style={{ marginTop: 10 }}>
          Create Direct Chat
        </button>
      </div>

      <div>
        <h3>Group Chat</h3>
        <input
          placeholder="Group title"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <UserPicker
          token={token}
          selected={groupSelected}
          setSelected={setGroupSelected}
          multi={true}
        />
        <button onClick={createGroup} style={{ marginTop: 10 }}>
          Create Group Chat
        </button>
      </div>
    </div>
  );
}