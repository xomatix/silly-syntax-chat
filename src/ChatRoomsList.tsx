import React, { useEffect, useState } from "react";
import { ViewsController } from "./controllers/ViewsController";
import { ChatMessageNotify, HomeChatRoomModel } from "./controllers/Types";
import { RealTimeController } from "./controllers/RealTimeController";
import ChatRoom from "./ChatRoom/ChatRoom";
import ChatRoomsListElem from "./ChatRoomsListElem/ChatRoomsListElem";

function ChatRoomsList() {
  const [chatRooms, setChatRooms] = useState<HomeChatRoomModel[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<number>(0);
  const [recievedMessage, setRecievedMessage] =
    useState<ChatMessageNotify | null>(null);

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
    // <div
    //   className="flex h-full w-full items-center justify-center"
    //   style={{
    //     backgroundImage: backgroundImage,
    //     backgroundSize: "cover",
    //   }}
    // >
    //   <div className="w-full 2xl:w-[100rem] min-h-dvh 2xl:h-3/4 ">
    //     <div className="p-5 w-full h-full rounded rounded-lg items-center justify-center flex flex-col bg-sky-950 bg-opacity-50 backdrop-blur-md">

    //       <div className="grid grid-cols-3 w-full h-full">
    //         <div className="col-span-1 mr-1">
    //           <div className="flex">
    //             <input className="m-2 w-full rounded h-10" type="text"></input>
    //           </div>
    //           {chatRooms.map((chatRoom) => (
    //             <ChatRoomsListElem
    //               key={chatRoom.id}
    //               chatRoom={chatRoom}
    //               setSelectedChatRoom={setSelectedChatRoom}
    //             />
    //           ))}
    //         </div>

    //         <div className="border-l-2 pl-1 border-indigo-200 col-span-2 h-[100%]">
    //           <ChatRoom
    //             chatRoomId={selectedChatRoom}
    //             recievedMessage={recievedMessage}
    //           />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Chats</h2>
          {/* Chat room list */}
          <div className="space-y-4">
            {chatRooms.map((room) => (
              <ChatRoomsListElem
                key={room.id}
                chatRoom={room}
                setSelectedChatRoom={setSelectedChatRoom}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right main area */}
      <ChatRoom
        chatRoomId={selectedChatRoom}
        recievedMessage={recievedMessage}
      />
    </div>
  );
}

export default ChatRoomsList;
