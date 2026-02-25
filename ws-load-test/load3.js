const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

const TOTAL_USERS = 1000;
const CHAT_ID = 1;
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwiZW1haWwiOiJzaXJpQHRlc3QuY29tIiwiaWF0IjoxNzcyMDAyMjg1LCJleHAiOjE3NzIwODg2ODV9.wv5J4dOdgsIN-vPn29DaxaC5hJ7SzmNnlXKTuSBUiBE";

// Write intensity controls
const MESSAGES_PER_SECOND = 100; // Increase gradually (100, 200, 300...)
const RAMP_DELAY_MS = 5;

let clients = [];
let connectedCount = 0;
let totalMessagesSent = 0;

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
      if (connectedCount % 100 === 0) {
        console.log(`Connected: ${connectedCount}`);
      }
      client.subscribe(`/topic/chats/${CHAT_ID}`, () => {});
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    }
  });

  client.activate();
  return client;
}

// Ramp users gradually
let i = 0;
const rampInterval = setInterval(() => {
  if (i >= TOTAL_USERS) {
    clearInterval(rampInterval);
    console.log("All users connected.");
    startDbStress();
    return;
  }

  clients.push(createClient(i));
  i++;
}, RAMP_DELAY_MS);

// Stress DB with controlled concurrency
function startDbStress() {
  console.log("Starting DB stress test...");

  const intervalMs = 1000 / MESSAGES_PER_SECOND;

  setInterval(() => {
    const randomClient = clients[Math.floor(Math.random() * clients.length)];

    if (randomClient && randomClient.connected) {
      randomClient.publish({
        destination: `/app/chats/${CHAT_ID}/send`,
        body: JSON.stringify({
          content: `LoadTest-${Date.now()}`
        })
      });

      totalMessagesSent++;
      if (totalMessagesSent % 100 === 0) {
        console.log("Messages sent:", totalMessagesSent);
      }
    }
  }, intervalMs);
}