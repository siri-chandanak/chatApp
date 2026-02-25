    import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function connectSocket(token, onMessage) {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: () => {},
    reconnectDelay: 3000,
    onConnect: () => {
      console.log("WebSocket connected");
    },
  });

  client.activate();

  return client;
}