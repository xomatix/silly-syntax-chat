import { useEffect, useState } from "react";
import { RecordController } from "../controllers/RecordController";
import { ChatMessage } from "../controllers/Types";
import { FilePluginController } from "../controllers/FilePluginController";
import FileComponent from "./FileComponent";

interface EditDeleteMsgPreviewProps {
  ReplayMsgId: number;
  isAuthor: boolean;
  onEdit: (messageID: number, newValue: string) => Promise<void>;
  onDelete: (messageID: number) => Promise<void>;
}

function EditDeleteMsgPreview({
  ReplayMsgId,
  isAuthor,
  onEdit,
  onDelete,
}: EditDeleteMsgPreviewProps) {
  const [message, setMessage] = useState<ChatMessage | null>(null);
  const [file, setFile] = useState<number>(0);
  const [editMode, setEditMode] = useState(false);
  const [editedValue, setEditedValue] = useState("");

  useEffect(() => {
    async function fetchData() {
      let response = await RecordController.GetRecords({
        collectionName: "chat_message",
        filter: `id = ${ReplayMsgId}`,
        limit: 1,
      });
      if (response.success && response.data.length > 0) {
        setMessage(response.data[0]);
        setEditedValue(response.data[0].value);
      }

      let responseF = await FilePluginController.GetRecords({
        collectionName: "file_storage",
        filter: `ref_id = ${ReplayMsgId} && ref_type = 'chat_message'`,
        limit: 1,
      });
      if (responseF.success && responseF.data.length > 0) {
        setFile(responseF.data[0].id);
      }
    }

    fetchData();
  }, [ReplayMsgId]);

  const handleEdit = async () => {
    if (!message) return;

    await onEdit(ReplayMsgId, editedValue); // Use onEdit from props
    setEditMode(false);
  };

  const handleDelete = async () => {
    await onDelete(ReplayMsgId); // Use onDelete from props
  };

  if (!message) {
    return <div>Message deleted or unavailable.</div>;
  }

  return (
    <div className="text-black overflow-hidden px-1 mt-2 mb-1 border-l-2 border-slate-400">
      {message.is_file && (
        <FileComponent
          fileID={file}
          isAuthor={isAuthor}
          message={message.value ?? ""}
        />
      )}

      {!message.is_file && (
        <div>
          {editMode ? (
            <input
              type="text"
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="border rounded px-2 py-1"
            />
          ) : (
            <span>{message.value}</span>
          )}
        </div>
      )}

      {isAuthor && (
        <div className="flex gap-2 mt-2">
          {editMode ? (
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Edit
            </button>
          )}

          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Delete
          </button>

          {editMode && (
            <button
              onClick={() => setEditMode(false)}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EditDeleteMsgPreview;
