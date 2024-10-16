import React, { useEffect, useState } from "react";
import { ViewsController } from "./controllers/ViewsController";
import { ChatMessageNotify, HomeChatRoomModel } from "./controllers/Types";
import { RealTimeController } from "./controllers/RealTimeController";
import ChatRoom from "./ChatRoom/ChatRoom";
import ChatRoomsListElem from "./ChatRoomsListElem/ChatRoomsListElem";
import BackgroundImg from "./assets/tatry-morskie-oko.jpg";

function ChatRoomsList() {
  const [chatRooms, setChatRooms] = useState<HomeChatRoomModel[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<number>(0);
  const [recievedMessage, setRecievedMessage] =
    useState<ChatMessageNotify | null>(null);
  const backgroundImage = "url(" + BackgroundImg + ")";

  useEffect(() => {
    async function fetchAsync() {
      await handleReload();
    }
    fetchAsync();
    handleConnectToServer();
  }, []);

  //#region handlers
  const handleConnectToServer = async () => {
    await RealTimeController.ConnectToServer(handleReloadAfterUpdate);
  };

  const handleReloadAfterUpdate = async (o: ChatMessageNotify) => {
    console.log(o);
    setRecievedMessage(o);
    await handleReload();
  };

  const handleReload = async () => {
    console.log("reload messages");

    let resp = await ViewsController.GetView({ viewName: "home_chat_room" });
    let records: HomeChatRoomModel[] = resp.data;
    setChatRooms(records);
  };
  //#endregion

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: "cover",
      }}
    >
      <div className="flex p-3 rounded rounded-lg items-center justify-center flex-col m-0 bg-sky-950 bg-opacity-50 backdrop-blur-md">
        <div className="text-white text-4xl mb-4">Chat rooms under there:</div>
        <button
          className="bg-white text-blue-500 px-4 mb-4 py-2 rounded"
          onClick={handleReload}
        >
          download basic data
        </button>
        <button
          className="bg-white text-blue-500 px-4 py-2 rounded"
          onClick={handleConnectToServer}
        >
          Start connection
        </button>
        <div className="grid grid-cols-5">
          <div className="col-span-2">
            <div className="flex">
              <input className="m-2 w-full rounded h-10" type="text"></input>
            </div>
            {chatRooms.map((chatRoom) => (
              <ChatRoomsListElem
                key={chatRoom.id}
                chatRoom={chatRoom}
                setSelectedChatRoom={setSelectedChatRoom}
              />
            ))}
          </div>
          <div className="col-span-3 max-h-[100vh]">
            <ChatRoom
              chatRoomId={selectedChatRoom}
              recievedMessage={recievedMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomsList;
