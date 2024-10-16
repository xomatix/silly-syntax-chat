import React from "react";
import { HomeChatRoomModel } from "../controllers/Types";

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
      onClick={() => setSelectedChatRoom(chatRoom.id)}
      className="text-2xl mb flex flex-col p-3 border border-white rounded my-2"
    >
      <div>{chatRoom.name}</div>
      <div>
        {chatRoom.last_message} by {chatRoom.last_message_user_id}
      </div>
    </div>
  );
}

export default ChatRoomsListElem;
