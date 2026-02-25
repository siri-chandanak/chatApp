import axios from "axios";

const API = "http://localhost:8080";

export async function login(email, password) {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  return res.data.token;
}

export async function register(email, password, displayName) {
  const res = await axios.post(`${API}/auth/register`, {
    email,
    password,
    displayName,
  });
  return res.data.token;
}