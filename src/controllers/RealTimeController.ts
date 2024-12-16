import { BaseUrlWebSocket } from "./Constants";
import { ChatMessageNotify } from "./Types";

export class RealTimeController {
  static ConnectToServer = async (
    func: (o: ChatMessageNotify) => Promise<void>
  ): Promise<void> => {
    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem("bonanza_token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const serverAddress = `${BaseUrlWebSocket}/connectToChat?token=${token}`;
      // Create WebSocket connection with token in query string
      const socket = new WebSocket(serverAddress);

      // Connection opened
      socket.onopen = () => {
        console.log("WebSocket connection opened");

        //socket.send(JSON.stringify({ message: "Hello, server!" }));
      };

      socket.onmessage = async (event) => {
        const receivedMessage = event.data;
        console.log("Message from server:", receivedMessage);
        try {
          let obj: ChatMessageNotify = JSON.parse(receivedMessage);
          await func(obj);
        } catch (error) {}
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
  };
}
