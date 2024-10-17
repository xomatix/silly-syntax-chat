import React, { useEffect, useRef, useState } from "react";
import { RecordController } from "../controllers/RecordController";
import {
  ChatMessage,
  ChatMessageNotify,
  ChatRoomModel,
  DataInsertModel,
  DataListModel,
  HomeChatRoomModel,
} from "../controllers/Types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import BackgroundImg from "../assets/tatry-morskie-oko.jpg";
import PaperClip from "../assets/paper-clip.svg";
import Send from "../assets/send.svg";
import AddUser from "../assets/add-user.svg";
import PopupComponent from "../Popup/PopupComponent";
import AddUserToChatRoom from "../CreateChatRoom/AddUserToChatRoom";

function ChatRoom({
  chatRoomId,
  recievedMessage,
}: {
  chatRoomId: number;
  recievedMessage: ChatMessageNotify | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoomModel>({} as ChatRoomModel);
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [messageValue, setMessageValue] = useState<string>("");
  const [userID, setUserID] = useState<number>(0);
  const [animationParent] = useAutoAnimate();

  useEffect(() => {
    const fetchData = async () => {
      await handleReload();
      scrollToBottom();
    };

    setMessages([]);
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

  //#region handlers
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

    let mChatRoom: DataListModel = {
      collectionName: "chat_room",
      filter: `id = ${chatRoomId}`,
    };

    let recordsChatRoom = await RecordController.GetRecords(mChatRoom);
    setChatRoom(recordsChatRoom.data[0]);
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
  //#endregion

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat room header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-4">
        <div className="flex justify-between w-full">
          <div className="flex items-center space-x-4">
            <img
              src={BackgroundImg}
              alt="Selected chat room"
              className="w-12 h-12 rounded-full"
            />
            <h2 className="text-xl font-semibold">
              Selected Chat Room {chatRoomId}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddUser(true)}
              className="text-white rounded-full p-3 hover:bg-yellow-500"
            >
              <img src={AddUser} alt="Add chat-rooom" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 flex flex-col-reverse overflow-y-auto p-4 "
        ref={animationParent}
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex mt-1 ${
              message.user_id === userID ? "justify-end" : "justify-start"
            }`}
          >
            <div>
              <p
                className={`max-w-xs lg:max-w-md xl:max-w-lg py-2 px-4 rounded-[20px]  ${
                  message.user_id === userID
                    ? "bg-blue-500 text-white "
                    : "bg-gray-200 text-gray-800 "
                }
                    ${
                      index + 1 < messages.length &&
                      messages[index + 1].user_id === message.user_id
                        ? message.user_id === userID
                          ? "rounded-tr-[4px]"
                          : "rounded-tl-[4px]"
                        : ""
                    } 
                ${
                  index - 1 >= 0 &&
                  messages[index - 1].user_id === message.user_id
                    ? message.user_id === userID
                      ? "rounded-br-[4px]"
                      : "rounded-bl-[4px]"
                    : ""
                }    
                `}
              >
                {message.value}
              </p>
              <p
                className={`text-xs mt-1 opacity-75 ${
                  index - 1 >= 0 &&
                  messages[index - 1].user_id === message.user_id
                    ? "hidden"
                    : ""
                }`}
              >
                {message.created.split("T")[1].replace("Z", "")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            className="rounded-full p-2  hover:bg-yellow-500"
            onClick={() => alert("Not implemented!!!")}
          >
            <img src={PaperClip} alt="Send" className="w-6 h-6" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className=" text-white rounded-full p-2 hover:bg-yellow-500"
          >
            <img src={Send} alt="Send" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Add user popup*/}
      {showAddUser && (
        <PopupComponent onClose={() => setShowAddUser(false)}>
          <AddUserToChatRoom
            chatRoomId={chatRoomId}
            onClose={() => {
              setShowAddUser(false);
              //handleReload();
            }}
          />
        </PopupComponent>
      )}
    </div>
  );
}

export default ChatRoom;
