import React, { useEffect, useState } from "react";
import PaperClip from "../assets/paper-clip.svg";
import Send from "../assets/send.svg";
import { DataInsertModel } from "../controllers/Types";
import { RecordController } from "../controllers/RecordController";
import { FilePluginController } from "../controllers/FilePluginController";

function InputComponent({ chatRoomId }: { chatRoomId: number }) {
  const [messageValue, setMessageValue] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    setMessageValue("");
  }, [chatRoomId]);

  const handleSendMessage = async () => {
    if (messageValue.length <= 0) {
      return;
    }
    let user_id = Number(localStorage.getItem("bonanza_user_id"));
    if (user_id == null || user_id <= 0) return;
    let m: DataInsertModel = {
      collectionName: "chat_message",
      values: {
        chat_room_id: chatRoomId,
        value: messageValue,
        user_id: user_id,
        is_file: file != undefined,
      },
    };
    let insertedMessage = await RecordController.InsertData(m);

    if (file != undefined) {
      await FilePluginController.InsertData({
        file: file,
        ref_id: Number(insertedMessage.data),
        ref_type: "chat_message",
      });
    }

    await setMessageValue("");
    await setFile(undefined);
  };

  const handleSelectFile = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessageValue(e.target.files[0]?.name);
    }
  };

  const handleChangeMsgValue = async (e: any) => {
    if (e.target.value.length < messageValue.length) {
      await setFile(undefined);
      await setMessageValue("");
    }
    if (file == undefined) setMessageValue(e.target.value);
  };

  return (
    <div>
      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="file_input_component"
            className="rounded-full p-2  hover:bg-yellow-500 cursor-pointer"
          >
            <img src={PaperClip} alt="Send" className="w-6 h-6"></img>
          </label>
          <input
            type="file"
            id="file_input_component"
            className="hidden"
            onChange={handleSelectFile}
          ></input>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageValue}
            onChange={handleChangeMsgValue}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className=" text-white rounded-full p-2 hover:bg-yellow-500"
          >
            <img src={Send} alt="Send" className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputComponent;
