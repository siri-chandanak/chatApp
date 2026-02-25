import { useEffect, useState } from "react";
import { searchUsers } from "../api/users";

export default function UserPicker({ token, selected, setSelected, multi = true }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        const data = await searchUsers(q, token);
        setResults(data);
      } catch (e) {
        console.error(e);
      }
    }, 300); // debounce
    return () => clearTimeout(t);
  }, [q, token]);

  const toggleUser = (u) => {
    if (!multi) {
      setSelected([u]);
      return;
    }
    const exists = selected.some((x) => x.id === u.id);
    setSelected(exists ? selected.filter((x) => x.id !== u.id) : [...selected, u]);
  };

  return (
    <div style={{ padding: 12, border: "1px solid #333", borderRadius: 8 }}>
      <input
        placeholder="Search users by name/email (min 2 chars)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: "100%" }}
      />

      {results.length > 0 && (
        <div style={{ marginTop: 10, maxHeight: 160, overflowY: "auto" }}>
          {results.map((u) => {
            const isSelected = selected.some((x) => x.id === u.id);
            return (
              <div
                key={u.id}
                onClick={() => toggleUser(u)}
                style={{
                  padding: 8,
                  cursor: "pointer",
                  border: "1px solid #444",
                  marginBottom: 6,
                  opacity: isSelected ? 0.7 : 1,
                }}
              >
                <div><b>{u.displayName}</b></div>
                <div style={{ fontSize: 12 }}>{u.email}</div>
                <div style={{ fontSize: 12 }}>UserId: {u.id}</div>
              </div>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Selected:</div>
          {selected.map((u) => (
            <span
              key={u.id}
              style={{
                display: "inline-block",
                padding: "4px 8px",
                border: "1px solid #555",
                borderRadius: 999,
                marginRight: 6,
                marginTop: 6,
                fontSize: 12,
              }}
            >
              {u.displayName} (#{u.id})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}