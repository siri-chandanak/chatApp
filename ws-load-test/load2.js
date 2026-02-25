const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

const TOTAL_USERS = 1000;
const CHAT_ID = 1;
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwiZW1haWwiOiJzaXJpQHRlc3QuY29tIiwiaWF0IjoxNzcyMDAyMjg1LCJleHAiOjE3NzIwODg2ODV9.wv5J4dOdgsIN-vPn29DaxaC5hJ7SzmNnlXKTuSBUiBE";

let clients = [];
let connectedCount = 0;

function createClient(i) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    connectHeaders: {
      Authorization: `Bearer ${TOKEN}`
    },
    debug: () => {},
    reconnectDelay: 0,
    onConnect: () => {
      connectedCount++;
      console.log("Connected:", connectedCount);

      client.subscribe(`/topic/chats/${CHAT_ID}`, () => {});
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    }
  });

  client.activate();
  return client;
}

// Ramp users gradually (important)
let i = 0;
const rampInterval = setInterval(() => {
  if (i >= TOTAL_USERS) {
    clearInterval(rampInterval);
    console.log("All users created");
    startSending();
    return;
  }

  clients.push(createClient(i));
  i++;
}, 5); // 5ms ramp speed (adjustable)

function startSending() {
  console.log("Starting message traffic...");

  setInterval(() => {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];

    if (randomClient && randomClient.connected) {
      randomClient.publish({
        destination: `/app/chats/${CHAT_ID}/send`,
        body: JSON.stringify({
          content: "Load test message"
        })
      });
    }

  }, 200); // slower rate = more realistic
}