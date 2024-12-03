import { BaseUrl } from "./Constants";
import { RecordController } from "./RecordController";
import {
  DataDeleteModel,
  DataInsertModel,
  DataListModel,
  DataUpdateModel,
  FileInsertModel,
  ResponseMessage,
} from "./Types";

export class FilePluginController {
  static GetRecords = async (
    model: DataListModel
  ): Promise<ResponseMessage> => {
    model.collectionName = "files";
    return RecordController.GetRecords(model);
  };

  static GetFile = async (fileID: number): Promise<ResponseMessage | Blob> => {
    if (fileID <= 0 || fileID === null || fileID === undefined) {
      throw new Error("Invalid File ID.");
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
    ).then((response) => {
      if (response.headers.get("Content-Type")?.includes("text/plain")) {
        return response.json();
      }
      return response.blob();
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
    model.collectionName = "files";
    return RecordController.UpdateData(model);
  };

  static DeleteData = async (
    model: DataDeleteModel
  ): Promise<ResponseMessage> => {
    model.collectionName = "files";
    return RecordController.DeleteData(model);
  };
}
