import { useEffect, useState } from "react";
import { FilePluginController } from "../controllers/FilePluginController";
import FileDownloadIcon from "../assets/file-download.svg";

function FileComponent({
  isAuthor,
  fileID,
  message,
}: {
  isAuthor: boolean;
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
      {file && isImage && (
        <img
          className="cursor-pointer"
          src={URL.createObjectURL(file)}
          onClick={() => {
            const url = URL.createObjectURL(file);
            const a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.click();
            URL.revokeObjectURL(url);
          }}
        />
      )}
      {file && !isImage && (
        <div className="py-2 px-4 cursor-pointer flex">
          <a onClick={handleDownload}>{message}</a>
          <img
            style={{
              filter: isAuthor
                ? "invert(100%) sepia(4%) saturate(634%) hue-rotate(231deg) brightness(118%) contrast(88%)"
                : "invert(17%) sepia(0%) saturate(1042%) hue-rotate(134deg) brightness(102%) contrast(77%)",
            }}
            src={FileDownloadIcon}
            alt="Download file"
            className="ml-2 w-5 h-5"
          />
        </div>
      )}
    </div>
  );
}

export default FileComponent;
