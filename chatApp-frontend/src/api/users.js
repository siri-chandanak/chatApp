import axios from "axios";

const API = "http://localhost:8080";

export async function searchUsers(q, token) {
  const res = await axios.get(`${API}/api/users/search`, {
    params: { q },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getMe(token) {
  const res = await axios.get(`${API}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}