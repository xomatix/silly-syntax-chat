import { useState } from "react";
import { HomeChatRoomModel } from "../controllers/Types";
import BackgroundImg from "../assets/tatry-morskie-oko.jpg";

function ChatRoomsListElem({
  chatRoom,
  selectedChatRoomID,
  setSelectedChatRoom,
}: {
  chatRoom: HomeChatRoomModel;
  selectedChatRoomID: number;
  setSelectedChatRoom: (id: number) => void;
}) {
  const [customBackgroundImg, setCustomBackgroundImg] = useState<string | null>(
    null
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "image/jpeg" || file.type === "image/png") {
        const reader = new FileReader();
        reader.onload = () => {
          setCustomBackgroundImg(reader.result as string); 
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload a JPG or PNG image.");
      }
    }
  };

  return (
    <div
      key={chatRoom.id}
      className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded ${
        selectedChatRoomID === chatRoom.id ? "bg-gray-100" : ""
      }`}
      onClick={() => setSelectedChatRoom(chatRoom.id)}
    >
      <div className="relative">
        <img
          src={customBackgroundImg || BackgroundImg} 
          alt={`Chat room ${chatRoom.id}`}
          className="w-10 h-10 rounded-full"
        />
        <label
          htmlFor={`upload-${chatRoom.id}`}
          className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer rounded-full"
        >
          Edit
        </label>
        <input
          id={`upload-${chatRoom.id}`}
          type="file"
          accept="image/jpeg, image/png"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      <div>
        <p className="font-medium">{chatRoom.name}</p>
        <p className="text-xs text-gray-500">
          {chatRoom.last_message && chatRoom.last_message.length > 20
            ? `${chatRoom.last_message.slice(0, 20).trim()}...`
            : chatRoom.last_message}
        </p>
      </div>
    </div>
  );
}

export default ChatRoomsListElem;
