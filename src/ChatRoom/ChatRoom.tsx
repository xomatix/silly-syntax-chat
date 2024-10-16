import React, { useEffect, useRef, useState } from "react";
import { RecordController } from "../controllers/RecordController";
import {
  ChatMessage,
  ChatMessageNotify,
  DataInsertModel,
  DataListModel,
  HomeChatRoomModel,
} from "../controllers/Types";
import { useAutoAnimate } from "@formkit/auto-animate/react";

function ChatRoom({
  chatRoomId,
  recievedMessage,
}: {
  chatRoomId: number;
  recievedMessage: ChatMessageNotify | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageValue, setMessageValue] = useState<string>("");
  const [userID, setUserID] = useState<number>(0);
  const [animationParent] = useAutoAnimate();

  useEffect(() => {
    const fetchData = async () => {
      await handleReload();
      scrollToBottom();
    };

    let user_id = Number(localStorage.getItem("bonanza_user_id"));
    setUserID(user_id);
    console.log("downloading chatRoomId messages", chatRoomId);

    // Reset messages when chatRoomId changes
    fetchData();
  }, [chatRoomId]);

  useEffect(() => {
    const fetchData = async () => {
      await handleReload();
    };
    console.log("recievedMessage change", recievedMessage);

    if (
      recievedMessage != null &&
      recievedMessage.chat_room_id === chatRoomId
    ) {
      fetchData();
    }
  }, [recievedMessage]);

  const handleReload = async () => {
    let performClear = true;
    if (messages.length > 0 && messages[0].chat_room_id === chatRoomId) {
      performClear = false;
    }
    console.log("performClear", performClear);

    let filterNewMessages = "";
    if (messages.length > 0 && !performClear) {
      let dateStr = messages[0].created.replace("T", " ").replace("Z", "");
      filterNewMessages = `&& created > '${dateStr}'`;
    }

    let m: DataListModel = {
      collectionName: "chat_message",
      filter: `chat_room_id = ${chatRoomId} ${filterNewMessages}`,
    };

    let records = await RecordController.GetRecords(m);
    let data: ChatMessage[] = records.data;
    // Append the new messages to the existing ones
    if (data != null && data.length > 0) {
      if (performClear) setMessages([...data]);
      else setMessages((prevMessages) => [...data, ...prevMessages]);
    }
  };

  const handleSendMessage = async () => {
    if (messageValue.length <= 0) {
      return;
    }
    let user_id = Number(localStorage.getItem("bonanza_user_id"));
    if (user_id == null || user_id <= 0) return;
    let m: DataInsertModel = {
      collectionName: "chat_message",
      values: {
        chat_room_id: chatRoomId,
        value: messageValue,
        user_id: user_id,
      },
    };
    await RecordController.InsertData(m);
    setMessageValue("");
  };
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-200 text-center p-4 max-h-10">
        <p className="text-gray-600 text-sm">ChatRoom: {chatRoomId}</p>
      </div>

      {/* Message List (growing from bottom) */}
      <ul
        ref={animationParent}
        className="flex-1 overflow-y-auto flex flex-col-reverse p-4 bg-gray-100 max-h-80"
      >
        {messages.map((message) => (
          <li
            key={message.id}
            className={`mb-2  flex ${
              message.user_id === userID ? "justify-end" : "justify-start"
            }`}
          >
            <div className="bg-white shadow p-2 rounded max-w-80 wrap">
              <p className="text-sm text-pretty">{message.value}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(message.created).toLocaleString()}
              </p>
              <p>Created by {message.user_id}</p>
            </div>
          </li>
        ))}
        <div ref={messagesEndRef} />
      </ul>

      {/* Footer */}
      <div className="bg-gray-200 text-center p-4 max-h-10 flex  items-center">
        <input
          id="chat"
          value={messageValue}
          onChange={(e) => setMessageValue(e.target.value)}
          type="text"
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="..."
        ></input>
        <button
          type="submit"
          onClick={handleSendMessage}
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 "
        >
          <svg
            className="w-5 h-5 rotate-90 rtl:-rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 20"
          >
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;
