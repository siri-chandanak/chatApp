const axios = require("axios");
const { Client } = require("@stomp/stompjs");
const SockJS = require("sockjs-client");

const API = "http://localhost:8080";
const TOTAL_USERS = 10000;
const CHAT_TITLE = "LoadTestGroup";

let users = [];
let clients = [];
let chatId = null;

/* -------------------------
   STEP 1 — Register Users
--------------------------*/
async function registerUsers() {
  console.log("Registering users...");

  for (let i = 1001; i < TOTAL_USERS; i++) {
    const email = `user${i}@test.com`;
    const password = "password123";

    try {
      const res = await axios.post(`${API}/auth/register`, {
        email,
        password,
        displayName: `User${i}`
      });

      users.push({
        email,
        token: res.data.token
      });

      if (i % 50 === 0) console.log("Registered:", i);

    } catch (err) {
      console.log("User exists, logging in:", email);

      const res = await axios.post(`${API}/auth/login`, {
        email,
        password
      });

      users.push({
        email,
        token: res.data.token
      });
    }
  }

  console.log("All users ready.");
}

/* -------------------------
   STEP 2 — Create Group Chat
--------------------------*/
async function createGroupChat() {
  console.log("Creating group chat...");

  const firstUser = users[0];

  const userIds = Array.from({ length: TOTAL_USERS }, (_, i) => i + 1);

  const res = await axios.post(
    `${API}/api/chats/group`,
    {
      title: CHAT_TITLE,
      memberUserIds: userIds
    },
    {
      headers: { Authorization: `Bearer ${firstUser.token}` }
    }
  );

  chatId = res.data.id;
  console.log("Chat created with ID:", chatId);
}

/* -------------------------
   STEP 3 — Connect WebSockets
--------------------------*/
function connectUsers() {
  console.log("Connecting WebSockets...");

  let connected = 0;

  users.forEach((user, index) => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${user.token}`
      },
      debug: () => {},
      reconnectDelay: 0,
      onConnect: () => {
        connected++;
        if (connected % 100 === 0)
          console.log("Connected:", connected);

        client.subscribe(`/topic/chats/${chatId}`, () => {});
      }
    });

    client.activate();
    clients.push(client);
  });
}

/* -------------------------
   STEP 4 — Simulate Traffic
--------------------------*/
function startTraffic() {
  console.log("Starting traffic...");

  setInterval(() => {
    const randomClient =
      clients[Math.floor(Math.random() * clients.length)];

    if (randomClient && randomClient.connected) {
      randomClient.publish({
        destination: `/app/chats/${chatId}/send`,
        body: JSON.stringify({
          content: "Load test message"
        })
      });
    }
  }, 100);
}

/* -------------------------
   MAIN FLOW
--------------------------*/
(async () => {
  await registerUsers();
  await createGroupChat();
  connectUsers();

  setTimeout(() => {
    startTraffic();
  }, 8000);
})();