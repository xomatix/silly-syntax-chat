import { useEffect, useState } from "react";
import { RecordController } from "../controllers/RecordController";
import { ChatMessage } from "../controllers/Types";
import { FilePluginController } from "../controllers/FilePluginController";
import FileComponent from "./FileComponent";

function ReplayMsgPreview({
  ReplayMsgId,
  isAuthor,
}: {
  ReplayMsgId: number;
  isAuthor: boolean;
}) {
  const [replayMsg, setReplayMsg] = useState<ChatMessage | null>(null);
  const [file, setFile] = useState<number>(0);

  useEffect(() => {
    async function downloadData() {
      let response = await RecordController.GetRecords({
        collectionName: "chat_message",
        filter: `id = ${ReplayMsgId}`,
        limit: 1,
      });
      if (response.success == true && response.data.length > 0) {
        setReplayMsg(response.data[0]);
      }

      let responseF = await FilePluginController.GetRecords({
        collectionName: "file_storage",
        filter: `ref_id = ${ReplayMsgId} && ref_type = 'chat_message'`,
        limit: 1,
      });
      console.log(responseF);
      if (responseF.success == true && responseF.data.length > 0) {
        let fileBlbId = responseF.data[0].id;
        setFile(fileBlbId);
      }
    }

    return () => {
      downloadData();
    };
  }, [ReplayMsgId]);

  return (
    <div
      className={` text-black overflow-hidden px-1  mt-2 mb-1 border-l-2 border-slate-400 `}
    >
      {replayMsg?.is_file && (
        <FileComponent
          fileID={file}
          isAuthor={isAuthor}
          message={replayMsg?.value ?? ""}
        />
      )}
      {!replayMsg?.is_file && replayMsg?.value != undefined && replayMsg.value}
    </div>
  );
}

export default ReplayMsgPreview;
