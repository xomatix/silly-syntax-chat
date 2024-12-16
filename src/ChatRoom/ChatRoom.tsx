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
  const [showAddUser, setShowAddUser] = useState<boolean>(false);
  const [messageFiles, setMessageFiles] = useState<Map<number, number>>(
    new Map<number, number>()
  );
  const [userID, setUserID] = useState<number>(0);
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editedMessageText, setEditedMessageText] = useState<string>('');
  const [animationParent] = useAutoAnimate();
  const [showMenu, setShowMenu] = useState<number | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null); 


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null); 
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
    let user_id = Number(localStorage.getItem("bonanza_user_id"));
    setUserID(user_id);

    fetchData();
  }, [chatRoomId]);

  useEffect(() => {
    const fetchData = async () => {
      await handleReload();
    };

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
      if (performClear) await setMessages([...data]);
      else {
        await setMessages((prevMessages) => [...data, ...prevMessages]);
      }
    }

    let mChatRoom: DataListModel = {
      collectionName: "chat_room",
      filter: `id = ${chatRoomId}`,
    };

    let recordsChatRoom = await RecordController.GetRecords(mChatRoom);
    setChatRoom(recordsChatRoom.data[0]);
  };

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

  const handleEditMessage = (messageID: number, currentValue: string) => {
    setEditingMessageId(messageID);
    setEditedMessageText(currentValue);
    setShowMenu(null); 
  };

  const handleSaveEditMessage = async () => {
    if (editingMessageId === null || editedMessageText === '') return;

    const updatedMessages = messages.map((message) =>
      message.id === editingMessageId
        ? { ...message, value: editedMessageText }
        : message
    );
    setMessages(updatedMessages);

    const response = await RecordController.UpdateData({
      ID: editingMessageId,
      collectionName: "chat_message",
      values: {
        value: editedMessageText,
      },
    });

    if (!response.success) {
      alert("Failed to update the message");
    }

    setEditingMessageId(null);
    setEditedMessageText('');
    setShowMenu(null); 
  };

  const handleDeleteMessage = async (messageID: number) => {
    const updatedMessages = messages.filter((message) => message.id !== messageID);
    setMessages(updatedMessages);

    const response = await RecordController.DeleteData({
      ID: messageID,
      collectionName: "chat_message",
    });

    if (!response.success) {
      alert("Failed to delete the message");
    }

    setShowMenu(null);
  };

  const handleReplyMessage = (message: ChatMessage) => {
    setReplyMessage(message);
    setShowMenu(null);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-4">
        <div className="flex justify-between w-full">
          <div className="flex items-center space-x-4">
            <img
              src={BackgroundImg}
              alt="Selected chat room"
              className="w-12 h-12 rounded-full"
            />
            <h2 className="text-xl font-semibold">Selected Chat Room {chatRoomId}</h2>
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

      <div
        className="flex-1 flex flex-col-reverse overflow-y-auto p-4"
        ref={animationParent}
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex mt-1 group ${
              message.user_id === userID ? "justify-end" : "justify-start"
            } relative`}
          >
            <div>
              <div className="flex items-center space-x-2">
                {message.user_id === userID && (
                  <>
                    {/* Three dots button */}
                    <button
                      onClick={() => setShowMenu(showMenu === message.id ? null : message.id)}
                      className="text-gray-600 hover:bg-gray-200 rounded-full p-2"
                    >
                      ...
                    </button>

                    {/* Edit, Delete, and Reply Menu */}
                    {showMenu === message.id && (
                      <div
                        ref={menuRef}
                        className="absolute bg-white shadow-md rounded-md mt-2 right-0 bottom-full"
                      >
                        <button
                          onClick={() => handleReplyMessage(message)}
                          className="block w-full text-left p-2 hover:bg-blue-100"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => handleEditMessage(message.id, message.value)}
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
                  </>
                )}

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
                    className={`max-w-xs lg:max-w-md xl:max-w-lg  rounded-[20px] 
                    ${message.is_file ? "overflow-hidden" : "py-2 px-4"}
                    ${message.user_id === userID ? "bg-blue-500 text-white " : "bg-gray-200 text-gray-800 "}
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
                )}
              </div>

              <p
                className={`text-xs mt-1 opacity-75 ${
                  index - 1 >= 0 && messages[index - 1].user_id === message.user_id
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

      <InputComponent
        chatRoomId={chatRoomId}
        replyMessage={replyMessage}
        clearReplyMessage={() => setReplyMessage(null)}
      />

      {showAddUser && (
        <PopupComponent onClose={() => setShowAddUser(false)}>
          <AddUserToChatRoom
            chatRoomId={chatRoomId}
            onClose={() => {
              setShowAddUser(false);
            }}
          />
        </PopupComponent>
      )}
    </div>
  );
}

export default ChatRoom;
