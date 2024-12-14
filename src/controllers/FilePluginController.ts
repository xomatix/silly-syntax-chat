import { BaseUrl } from "./Constants";
import { RecordController } from "./RecordController";
import {
  DataDeleteModel,
  DataListModel,
  DataUpdateModel,
  FileInsertModel,
  ResponseMessage,
} from "./Types";

export class FilePluginController {
  static GetRecords = async (
    model: DataListModel
  ): Promise<ResponseMessage> => {
    model.collectionName = "file_storage";
    return RecordController.GetRecords(model);
  };

  static GetFile = async (fileID: number): Promise<ResponseMessage | Blob> => {
    if (fileID <= 0 || fileID === null || fileID === undefined) {
      throw new Error("Invalid File ID.");
    }

    const cacheKey = `fileplugin_${fileID}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      return base64ToBlob(cachedData);
    }

    const myHeaders = new Headers();
    const token = localStorage.getItem("bonanza_token");
    myHeaders.append("Authorization", token ? token : "");

    let response = await fetch(
      BaseUrl + "/files/read?fileID=" + fileID.toString(),
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      }
    ).then(async (response) => {
      if (response.headers.get("Content-Type")?.includes("text/plain")) {
        return response.json();
      }
      let blb = await response.blob();
      let base64String: string = await blobToBase64(blb);
      try {
        await localStorage.setItem(cacheKey, base64String);
      } catch (error) {
        console.log("Cache exceded size limit:", error);
      }

      return blb;
    });

    return response;
  };

  static InsertData = async (
    model: FileInsertModel
  ): Promise<ResponseMessage> => {
    const myHeaders = new Headers();
    const token = localStorage.getItem("bonanza_token");
    myHeaders.append("Authorization", token ? token : "");
    const formData = new FormData();
    formData.append("file", model.file);
    formData.append("ref_type", model.ref_type);
    formData.append("ref_id", model.ref_id.toString());

    let response = await fetch(BaseUrl + "/files/upload", {
      method: "POST",
      body: formData,
      headers: myHeaders,
      redirect: "follow",
    }).then((response) => {
      return response.json();
    });

    return response;
  };

  static UpdateData = async (
    model: DataUpdateModel
  ): Promise<ResponseMessage> => {
    model.collectionName = "file_storage";
    return RecordController.UpdateData(model);
  };

  static DeleteData = async (
    model: DataDeleteModel
  ): Promise<ResponseMessage> => {
    model.collectionName = "file_storage";
    return RecordController.DeleteData(model);
  };
}

function base64ToBlob(base64String: string) {
  const base64O = base64String.split(",");
  const mimeType = base64O[0].split(";")[0].split(":")[1];
  const base64Data = base64O[1];

  const binaryString = window.atob(base64Data);

  const byteNumbers = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    byteNumbers[i] = binaryString.charCodeAt(i);
  }

  return new Blob([byteNumbers], { type: mimeType });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error("Failed to convert Blob to Base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
