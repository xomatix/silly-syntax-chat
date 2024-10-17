import { useEffect, useState } from "react";
import ChatAdd from "../assets/chat-add.svg";
import {
  DataInsertModel,
  DataListModel,
  UserModel,
} from "../controllers/Types";
import { RecordController } from "../controllers/RecordController";
import BackgroundImg from "../assets/tatry-morskie-oko.jpg";
import AddUser from "../assets/add-user.svg";

function AddUserToChatRoom({
  onClose,
  chatRoomId,
}: {
  onClose: () => void;
  chatRoomId: number;
}) {
  const [userNameValue, setUserNameValue] = useState<string>("");
  const [foundUsers, setFoundUsers] = useState<UserModel[]>([]);

  useEffect(() => {
    async function fetchAsync() {
      if (userNameValue.length <= 0) {
        setFoundUsers([]);
        return;
      }

      let m: DataListModel = {
        collectionName: "users",
        filter: `(username like '%${userNameValue}%' OR email like '%${userNameValue}%') 
        AND id NOT IN (SELECT user_id from chat_room_participant where chat_room_id = ${chatRoomId})`,
      };
      let response = await RecordController.GetRecords(m);
      if (response.data !== null && response.data.length > 0) {
        setFoundUsers(response.data);
      } else {
        setFoundUsers([]);
      }
    }
    fetchAsync();
  }, [userNameValue]);

  const handleAddUserToChatRoom = async (selectedUserId: number) => {
    console.log("   userID " + selectedUserId);
    console.log("   chatID " + chatRoomId);
    if (chatRoomId <= 0 || selectedUserId <= 0) {
      alert("Internal error. Please select a user to add.");
      return;
    }
    let mChatRoomUser: DataInsertModel = {
      collectionName: "chat_room_participant",
      values: {
        chat_room_id: chatRoomId,
        user_id: selectedUserId,
      },
    };
    await RecordController.InsertData(mChatRoomUser);
    onClose();
  };

  return (
    <div>
      <div className="text-xl font-bold pb-2 px-2">Add user to Chat Room</div>
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search for user to add to chat room..."
            value={userNameValue}
            onChange={(e) => setUserNameValue(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className=" text-white rounded-full p-2 hover:bg-yellow-500">
            <img src={ChatAdd} alt="Add chat-rooom" className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col space-y-2">
          {foundUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between space-x-3 cursor-pointer p-2 rounded`}
              onClick={() => handleAddUserToChatRoom(user.id)}
            >
              <div className="flex space-x-3">
                <img
                  src={BackgroundImg}
                  alt={`User id ${user.id}`}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button className=" text-white rounded-full p-2 hover:bg-yellow-500">
                <img
                  src={AddUser}
                  alt="Add user to chat-rooom"
                  className="w-6 h-6"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddUserToChatRoom;
