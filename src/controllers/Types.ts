export type ResponseMessage = {
  message: string;
  success: boolean;
  data: any;
};

export type LoginModel = {
  login: string;
  password: string;
};

export type ViewModel = {
  viewName: string;
};

export type DataListModel = {
  collectionName: string;
  filter?: string;
  size?: number;
  limit?: number;
  ID?: number[];
};

export type RecordModel = {
  [key: string]: any;
};

export type DataInsertModel = {
  collectionName: string;
  values: Map<string, any> | RecordModel | object;
};

export type DataUpdateModel = {
  collectionName: string;
  ID: number;
  values: Map<string, any>[] | RecordModel | object;
};

export type DataDeleteModel = {
  collectionName: string;
  ID: number;
};

export type HomeChatRoomModel = {
  created: Date;
  id: number;
  last_message: string;
  last_message_user_id: number;
  name: string;
  updated: Date;
};

export type ChatRoomModel = HomeChatRoomModel & {
  is_dm: boolean;
};

export interface ChatMessage {
  chat_room_id: number;
  created: string;
  id: number;
  updated: string;
  user_id: number;
  value: string;
}

export interface ChatMessageNotify {
  chat_room_id: number;
  message_id: number;
}

export type UserModel = {
  id: number;
  created: Date;
  updated: Date;
  username: string;
  email: string;
};

export type FileInsertModel = {
  file: any;
  ref_id: number;
  ref_type: string;
};
