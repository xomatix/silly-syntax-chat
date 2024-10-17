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
  return (
    <div
      key={chatRoom.id}
      className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded ${
        selectedChatRoomID === chatRoom.id ? "bg-gray-100" : ""
      }`}
      onClick={() => setSelectedChatRoom(chatRoom.id)}
    >
      <img
        src={BackgroundImg}
        alt={`Chat room ${chatRoom.id}`}
        className="w-10 h-10 rounded-full"
      />
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
