import { useEffect, useState } from "react";
import { FilePluginController } from "../controllers/FilePluginController";

function FileComponent({
  fileID,
  message,
}: {
  fileID: number;
  message: string;
}) {
  const [file, setFile] = useState<Blob>();
  const [isImage, setIsImage] = useState<boolean>(false);

  useEffect(() => {
    async function download() {
      await downloadFileFromServer();
    }

    download();
  }, [fileID]);

  const downloadFileFromServer = async () => {
    let res = await FilePluginController.GetFile(fileID);
    if (res instanceof Blob) {
      await setFile(res);
      if (res.type.startsWith("image/")) {
        await setIsImage(true);
      }
    }
  };

  const handleDownload = () => {
    if (file && !isImage) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = message;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      {file && isImage && <img src={URL.createObjectURL(file)} />}
      {file && !isImage && (
        <div className="py-2 px-4">
          <a onClick={handleDownload}>{message}</a>
        </div>
      )}
    </div>
  );
}

export default FileComponent;
