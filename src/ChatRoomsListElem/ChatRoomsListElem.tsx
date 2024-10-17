import { HomeChatRoomModel } from "../controllers/Types";
import BackgroundImg from "../assets/tatry-morskie-oko.jpg";

function ChatRoomsListElem({
  chatRoom,
  setSelectedChatRoom,
}: {
  chatRoom: HomeChatRoomModel;
  setSelectedChatRoom: (id: number) => void;
}) {
  return (
    <div
      key={chatRoom.id}
      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
      onClick={() => setSelectedChatRoom(chatRoom.id)}
    >
      <img
        src={BackgroundImg}
        alt={`Chat room ${chatRoom.id}`}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <p className="font-medium">{chatRoom.name}</p>
        <p className="text-sm text-gray-500">{chatRoom.last_message}</p>
      </div>
    </div>
  );
}

export default ChatRoomsListElem;
