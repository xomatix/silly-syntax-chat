import { useEffect, useRef, useState } from "react";
import { RecordController } from "../controllers/RecordController";
import {
  ChatMessage,
  ChatMessageNotify,
  ChatRoomModel,
  DataListModel,
  FileModel,
} from "../controllers/Types";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import BackgroundImg from "../assets/tatry-morskie-oko.jpg";
import AddUser from "../assets/add-user.svg";
import ReplyIcon from "../assets/reply.svg";
import PopupComponent from "../Popup/PopupComponent";
import AddUserToChatRoom from "../CreateChatRoom/AddUserToChatRoom";
import InputComponent from "./InputComponent";
import { FilePluginController } from "../controllers/FilePluginController";
import FileComponent from "./FileComponent";
import ReplayMsgPreview from "./ReplayMsgPreview";

function ChatRoom({
  chatRoomId,
  recievedMessage,
}: {
  chatRoomId: number;
  recievedMessage: ChatMessageNotify | null;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoomModel>({} as ChatRoomModel);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [messageFiles, setMessageFiles] = useState<Map<number, number>>(
    new Map<number, number>()
  );
  const [userID, setUserID] = useState<number>(0);
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [animationParent] = useAutoAnimate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      await handleReload();
      scrollToBottom();
    };

    setMessages([]);
    setFilteredMessages([]);
    setSearchTerm("");
    setIsSearching(false);
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

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMessages(messages);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const searchResults = messages.filter((message) =>
      message.value.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(searchResults);
  }, [searchTerm, messages]);

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
      // limit: 5,
    };

    let records = await RecordController.GetRecords(m);
    let data: ChatMessage[] = records.data;
    // Append the new messages to the existing ones

    if (data != null && data.length > 0) {
      await downloadFilesUnderMessagesInfo(data);
      if (performClear) {
        await setMessages([...data]);
        await setFilteredMessages([...data]);
      } else {
        await setMessages((prevMessages) => [...data, ...prevMessages]);
        await setFilteredMessages((prevMessages) => [...data, ...prevMessages]);
      }
    }

    let mChatRoom: DataListModel = {
      collectionName: "chat_room",
      filter: `id = ${chatRoomId}`,
    };

    let recordsChatRoom = await RecordController.GetRecords(mChatRoom);
    setChatRoom(recordsChatRoom.data[0]);
  };

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadFilesUnderMessagesInfo = async (messagesArr: ChatMessage[]) => {
    if (messagesArr.filter((message) => message.is_file).length <= 0) {
      return;
    }
    var ids = messagesArr
      .filter((message) => message.is_file)
      .map((message) => message.id)
      .join(",");

    var files = await FilePluginController.GetRecords({
      collectionName: "file_storage",
      filter: `ref_id in (${ids}) and ref_type = 'chat_message'`,
    });

    if (files.success == false) {
      return;
    }

    let array: FileModel[] = files.data;
    let newObject = messageFiles;
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
      newObject.set(element.ref_id, element.id);
    }
    await setMessageFiles(newObject);
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
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent w-full outline-none focus:w-80 transition-all duration-500 ease-in-out"
              />
            </div>
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
        {isSearching && filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 my-4">
            No messages found for "{searchTerm}"
          </div>
        ) : (
          filteredMessages.map((message, index) => (
            <div
              key={message.id}
              className={`flex mt-1 group ${
                message.user_id === userID ? "justify-end" : "justify-start"
              } `}
            >
              <div>
                <div className="flex items-center">
                  {message.user_id === userID && (
                    <img
                      style={{
                        filter:
                          "invert(42%) sepia(1%) saturate(0%) hue-rotate(351deg) brightness(92%) contrast(90%)",
                      }}
                      src={ReplyIcon}
                      onClick={() => setReplyMessage(message)}
                      className="w-6 h-6 pr-2 cursor-pointer hidden group-hover:block"
                    ></img>
                  )}

                  <p
                    className={`max-w-xs lg:max-w-md xl:max-w-lg  rounded-[20px] 
                  ${message.is_file ? "overflow-hidden" : "py-2 px-4"}
                  ${
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
                    {message.reply_message_id > 0 && (
                      <ReplayMsgPreview
                        ReplayMsgId={message.reply_message_id}
                        isAuthor={message.user_id === userID}
                      />
                    )}
                    {message.is_file && (
                      <FileComponent
                        isAuthor={message.user_id === userID}
                        fileID={Number(messageFiles.get(message.id))}
                        message={message.value}
                      />
                    )}
                    {!message.is_file && message.value}
                  </p>

                  {message.user_id !== userID && (
                    <img
                      style={{
                        filter:
                          "invert(42%) sepia(1%) saturate(0%) hue-rotate(351deg) brightness(92%) contrast(90%)",
                      }}
                      src={ReplyIcon}
                      onClick={() => setReplyMessage(message)}
                      className="w-6 h-6 pl-2 cursor-pointer hidden group-hover:block"
                    ></img>
                  )}
                </div>

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
          ))
        )}
      </div>

      {/* Input area */}
      <InputComponent
        chatRoomId={chatRoomId}
        replyMessage={replyMessage}
        clearReplyMessage={() => setReplyMessage(null)}
      />

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
