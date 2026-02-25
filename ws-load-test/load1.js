const { Client } = require('@stomp/stompjs');
const SockJS = require('sockjs-client');

const TOTAL_USERS = 1000;
const CHAT_ID = 1;
const TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0IiwiZW1haWwiOiJzaXJpQHRlc3QuY29tIiwiaWF0IjoxNzcyMDAyMjg1LCJleHAiOjE3NzIwODg2ODV9.wv5J4dOdgsIN-vPn29DaxaC5hJ7SzmNnlXKTuSBUiBE";

let connected = 0;

for (let i = 0; i < TOTAL_USERS; i++) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    connectHeaders: {
      Authorization: `Bearer ${TOKEN}`
    },
    debug: () => {},
    reconnectDelay: 0,
    onConnect: () => {
      connected++;
      console.log("Connected:", connected);

      client.subscribe(`/topic/chats/${CHAT_ID}`, () => {});
    },
    onStompError: (frame) => {
      console.error("STOMP error:", frame);
    }
  });

  client.activate();
}