import { useEffect, useState } from "react";
import { ViewsController } from "./controllers/ViewsController";
import { ChatMessageNotify, HomeChatRoomModel } from "./controllers/Types";
import { RealTimeController } from "./controllers/RealTimeController";
import ChatRoom from "./ChatRoom/ChatRoom";
import ChatRoomsListElem from "./ChatRoomsListElem/ChatRoomsListElem";
import { AuthController } from "./controllers/AuthController";
import ChatAdd from "./assets/chat-add.svg";
import Logout from "./assets/logout.svg";
import PopupComponent from "./Popup/PopupComponent";
import CreateChatRoom from "./CreateChatRoom/CreateChatRoom";
import ProfileSettings from "./ProfileEdit/ProfileSettings";

function ChatRoomsList() {
  const [chatRooms, setChatRooms] = useState<HomeChatRoomModel[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<number>(0);
  const [showAddChatRoom, setShowAddChatRoom] = useState<boolean>(false);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [recievedMessage, setRecievedMessage] = useState<ChatMessageNotify | null>(null);

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

  const handleAddChatRoom = () => {
    setShowAddChatRoom(true);
  };

  const handleEditProfile = () => {
    setShowEditProfile(true); // Show the Edit Profile popup
  };

  const handleLogout = async () => {
    await AuthController.Logout();
    window.location.reload();
  };
  //#endregion

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between mb-4">
            <div className="text-xl font-semibold">Chats</div>
            <div className="flex space-x-2">
              <button
                onClick={handleAddChatRoom}
                className="text-white rounded-full p-2 hover:bg-yellow-500"
              >
                <img src={ChatAdd} alt="Add chat-rooom" className="w-6 h-6" />
              </button>
              <button
                onClick={handleLogout}
                className=" text-white rounded-full p-2 hover:bg-yellow-500"
              >
                <img src={Logout} alt="Logout" className="w-6 h-6" />
              </button>
            </div>
          </div>
          {/* Chat room list */}
          <div className="space-y-4">
            {chatRooms.map((room) => (
              <ChatRoomsListElem
                key={room.id}
                selectedChatRoomID={selectedChatRoom}
                chatRoom={room}
                setSelectedChatRoom={setSelectedChatRoom}
              />
            ))}
          </div>
          {/* Edit Profile Button */}
          <button
            onClick={handleEditProfile}
            className="text-white bg-blue-500 p-2 rounded-md hover:bg-blue-600 mt-4"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Right main area */}
      <ChatRoom chatRoomId={selectedChatRoom} recievedMessage={recievedMessage} />

      {showAddChatRoom && (
        <PopupComponent onClose={() => setShowAddChatRoom(false)}>
          <CreateChatRoom
            onClose={() => {
              setShowAddChatRoom(false);
              handleReload();
            }}
          />
        </PopupComponent>
      )}

      {showEditProfile && (
        <PopupComponent onClose={() => setShowEditProfile(false)}>
          <ProfileSettings onClose={() => setShowEditProfile(false)} />
        </PopupComponent>
      )}
    </div>
  );
}

export default ChatRoomsList;
