import { useState } from "react";
import { login, register } from "../api/auth";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const submit = async () => {
    try {
        let token;
        if (isRegister) {
        token = await register(email, password, displayName);
        } else {
        token = await login(email, password);
        }

        localStorage.setItem("token", token); // 🔥 persist token
        setToken(token);

    } catch (err) {
        alert("Login/Register failed");
    }
    };

  return (
    <div>
      <h2>{isRegister ? "Register" : "Login"}</h2>
      {isRegister && (
        <input
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      )}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={submit}>Submit</button>
      <button onClick={() => setIsRegister(!isRegister)}>
        Switch to {isRegister ? "Login" : "Register"}
      </button>
    </div>
  );
}