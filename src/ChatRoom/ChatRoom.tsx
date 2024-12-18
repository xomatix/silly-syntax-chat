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
  const [_, setChatRoom] = useState<ChatRoomModel>({} as ChatRoomModel);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [messageFiles, setMessageFiles] = useState<Map<number, number>>(
    new Map<number, number>()
  );
  const [userID, setUserID] = useState<number>(0);
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessageText, setEditedMessageText] = useState<string>("");
  const [animationParent] = useAutoAnimate();
  const [showMenu, setShowMenu] = useState<number | null>(null); // Track which message has the menu
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null); // Ref for the dropdown menu

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null); // Close the menu if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    handleEditDeleteMessageNotification(recievedMessage);
  }, [recievedMessage]);

  const handleEditDeleteMessageNotification = async (
    recMsg: ChatMessageNotify | null
  ) => {
    if (recMsg == null || recMsg.message_type == "new_message") {
      return;
    } else if (recMsg.message_type == "update_message") {
      let filteredMessages: ChatMessage[] = await Promise.all(
        messages.map(async (message) => {
          if (message.id === recMsg.message_id) {
            return await handleDownloadEditedMsg(recMsg.message_id);
          } else return message;
        })
      );

      setMessages(filteredMessages);
      return;
    } else if (recMsg.message_type == "delete_message") {
      let filteredMessages: ChatMessage[] = messages.filter(
        (msg) => msg.id !== recMsg.message_id
      );
      setMessages(filteredMessages);
      return;
    }
  };

  const handleDownloadEditedMsg = async (id: number) => {
    let response = await RecordController.GetRecords({
      collectionName: "chat_message",
      filter: `id = ${id}`,
    });
    if (response.success && response.data.length > 0) {
      return response.data[0];
    }
    return {} as ChatMessage;
  };

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
    };

    let records = await RecordController.GetRecords(m);
    let data: ChatMessage[] = records.data;

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

  const handleEditMessage = (messageID: number, currentValue: string) => {
    setEditingMessageId(messageID);
    setEditedMessageText(currentValue);
    setShowMenu(null); // Close the menu when edit is clicked
  };

  const handleSaveEditMessage = async () => {
    if (editingMessageId === null || editedMessageText.trim() === "") {
      console.error("EditingMessageId or EditedMessageText is invalid");
      return;
    }

    try {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === editingMessageId
            ? { ...message, value: editedMessageText }
            : message
        )
      );
      let selMessage = messages.find(
        (message) => message.id === editingMessageId
      );
      const response = await RecordController.UpdateData({
        ID: editingMessageId,
        collectionName: "chat_message",
        values: {
          ...selMessage,
          value: editedMessageText,
        },
      });

      if (!response.success) {
        // Revert changes if API fails
        alert("Failed to update the message");
        return;
      }
    } catch (error) {
      console.error("Error saving the edited message:", error);
    } finally {
      setEditingMessageId(null);
      setEditedMessageText("");
      setShowMenu(null);
    }
  };

  const handleDeleteMessage = async (messageID: number) => {
    const updatedMessages = messages.filter(
      (message) => message.id !== messageID
    );
    setMessages(updatedMessages);

    try {
      // API Call to delete the message
      const response = await RecordController.DeleteData({
        ID: messageID,
        collectionName: "chat_message",
      });

      if (!response.success) {
        // Revert changes if API fails
        alert("Failed to delete the message");
        setMessages((prevMessages) => [
          ...prevMessages,
          messages.find((message) => message.id === messageID)!,
        ]); // Revert the deleted message
        return;
      }
    } catch (error) {
      console.error("Error deleting the message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        messages.find((message) => message.id === messageID)!,
      ]);
    }

    setShowMenu(null);
  };
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
            {/* Online Status Icon */}
            <span className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></span>
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
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 space-x-2">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent w-full focus:outline-none"
          />
        </div>
      </div>
      <div
        className="flex-1 flex flex-col-reverse overflow-y-auto p-4"
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
              } relative`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  {/* Conditional for reply icon (to the left of three dots for current user's message) */}
                  {message.user_id === userID && (
                    <img
                      style={{
                        filter:
                          "invert(42%) sepia(1%) saturate(0%) hue-rotate(351deg) brightness(92%) contrast(90%)",
                      }}
                      src={ReplyIcon}
                      onClick={() => setReplyMessage(message)}
                      className="w-6 h-6 pr-2 cursor-pointer group-hover:block"
                    />
                  )}

                  {/* Three dots button for menu */}
                  {message.user_id === userID && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowMenu(
                            showMenu === message.id ? null : message.id
                          )
                        }
                        className="text-gray-600 hover:bg-gray-200 rounded-full p-2"
                      >
                        ...
                      </button>

                      {/* Edit and Delete Menu positioned above the three dots */}
                      {showMenu === message.id && (
                        <div
                          ref={menuRef}
                          className="absolute bg-white shadow-md rounded-md mt-2 bottom-full left-0 z-50"
                        >
                          <button
                            onClick={() =>
                              handleEditMessage(message.id, message.value)
                            }
                            className="block w-full text-left p-2 hover:bg-yellow-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="block w-full text-left p-2 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conditionally show editing area */}
                  {editingMessageId === message.id ? (
                    <div>
                      <textarea
                        value={editedMessageText}
                        onChange={(e) => setEditedMessageText(e.target.value)}
                        rows={4}
                        className="w-full p-2 border rounded-md"
                      />
                      <button
                        onClick={handleSaveEditMessage}
                        className="mt-2 text-blue-500 hover:bg-blue-200 p-2 rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-[20px] ${
                        message.is_file ? "overflow-hidden" : "py-2 px-4"
                      } ${
                        message.user_id === userID
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      } ${
                        index + 1 < messages.length &&
                        messages[index + 1].user_id === message.user_id
                          ? message.user_id === userID
                            ? "rounded-tr-[4px]"
                            : "rounded-tl-[4px]"
                          : ""
                      } ${
                        index - 1 >= 0 &&
                        messages[index - 1].user_id === message.user_id
                          ? message.user_id === userID
                            ? "rounded-br-[4px]"
                            : "rounded-bl-[4px]"
                          : ""
                      }`}
                    >
                      {/* Reply Preview */}
                      {message.reply_message_id > 0 && (
                        <ReplayMsgPreview
                          ReplayMsgId={message.reply_message_id}
                          isAuthor={message.user_id === userID}
                        />
                      )}
                      {/* File Component */}
                      {message.is_file && (
                        <FileComponent
                          isAuthor={message.user_id === userID}
                          fileID={Number(messageFiles.get(message.id))}
                          message={message.value}
                        />
                      )}
                      {/* Text Message */}
                      <p className="break-words">
                        {!message.is_file && message.value}
                      </p>
                    </p>
                  )}

                  {/* Reply icon (for other users' messages) */}
                  {message.user_id !== userID && (
                    <img
                      style={{
                        filter:
                          "invert(42%) sepia(1%) saturate(0%) hue-rotate(351deg) brightness(92%) contrast(90%)",
                      }}
                      src={ReplyIcon}
                      onClick={() => setReplyMessage(message)}
                      className="w-6 h-6 pl-2 cursor-pointer hidden group-hover:block"
                    />
                  )}
                </div>

                {/* Time Stamp */}
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
