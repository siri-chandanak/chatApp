import { useEffect, useState } from "react";
import { getMe } from "../api/users";

export default function Profile({ token, onLogout }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMe(token);
        setUser(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    load();
  }, [token]);

  if (!user) return null;

  return (
    <div
      style={{
        padding: 12,
        borderBottom: "1px solid #444",
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: "bold" }}>
        👤 {user.displayName}
      </div>
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        📧 {user.email}
      </div>
      <div style={{ fontSize: 12, opacity: 0.5 }}>
        ID: {user.id}
      </div>

      <button
        onClick={onLogout}
        style={{ marginTop: 8 }}
      >
        Logout
      </button>
    </div>
  );
}