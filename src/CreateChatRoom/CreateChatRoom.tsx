import { useState } from "react";
import ChatAdd from "../assets/chat-add.svg";
import { RecordController } from "../controllers/RecordController";
import { DataInsertModel } from "../controllers/Types";

function CreateChatRoom({ onClose }: { onClose: () => void }) {
  const [chatNameValue, setChatNameValue] = useState<string>("");

  const handleAddChatRoom = async () => {
    if (
      chatNameValue.length <= 0 ||
      chatNameValue === null ||
      chatNameValue === ""
    ) {
      alert("Please enter a chat room name.");
      return;
    }

    let m: DataInsertModel = {
      collectionName: "chat_room",
      values: {
        name: chatNameValue,
        is_dm: false,
      },
    };

    let response = await RecordController.InsertData(m);

    let mChatRoomUser: DataInsertModel = {
      collectionName: "chat_room_participant",
      values: {
        chat_room_id: Number(response.data),
        user_id: Number(localStorage.getItem("bonanza_user_id")),
      },
    };
    await RecordController.InsertData(mChatRoomUser);
    onClose();
  };

  return (
    <div>
      <div className="text-xl font-bold pb-2 px-2">New Chat Room</div>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type new chat room name..."
          value={chatNameValue}
          onChange={(e) => setChatNameValue(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddChatRoom}
          className=" text-white rounded-full p-2 hover:bg-yellow-500"
        >
          <img src={ChatAdd} alt="Add chat-rooom" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default CreateChatRoom;
