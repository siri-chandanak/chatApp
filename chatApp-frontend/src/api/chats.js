import axios from "axios";

const API = "http://localhost:8080";

export async function getChats(token) {
  const res = await axios.get(`${API}/api/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getMessages(chatId, token) {
  const res = await axios.get(`${API}/api/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createDirectChat(otherUserId, token) {
  const res = await axios.post(
    `${API}/api/chats/direct`,
    { otherUserId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
export async function createGroupChat(title, memberUserIds, token) {
  const res = await axios.post(
    `${API}/api/chats/group`,
    { title, memberUserIds },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
export async function getChatDetails(chatId, token) {
  const res = await axios.get(
    `http://localhost:8080/api/chats/${chatId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
}