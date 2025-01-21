import { useState, useEffect } from "react";
import { DataUpdateModel } from "../controllers/Types";
import { RecordController } from "../controllers/RecordController";
import { FilePluginController } from "../controllers/FilePluginController";

interface ProfileSettingsProps {
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const [profileUserName, setUserName] = useState<string>("");
  const [profileEmail, setEmail] = useState<string>("");
  const [profilePassword, setPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  const user_id = Number(localStorage.getItem("bonanza_user_id"));
  //let user_id = Number(localStorage.getItem("bonanza_user_id"));

  useEffect(() => {
    async function fetchProfile() {
      if (user_id <= 0) {
        alert("No user ID saved in local storage");
        return;
      }

      const response = await RecordController.GetRecords({
        collectionName: "users",
        ID: [user_id],
      });

      if (!response.success || !response.data.length) {
        console.log("Cannot fetch user data");
        return;
      }

      const userData = response.data[0];
      setUserName(userData.username);
      setEmail(userData.email);

      if (userData.profilePicture) {
        const blob = new Blob([userData.profilePicture], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
      //  setProfilePicture(blob);
        setProfilePictureUrl(url);
      }
    }

    fetchProfile();
  }, [user_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUserName(value);
    } else if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        if (reader.result) {
          const newBlob = new Blob([reader.result as ArrayBuffer], { type: file.type });
          //setProfilePicture(newBlob);

          const url = URL.createObjectURL(newBlob);
          setProfilePictureUrl(url);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user_id <= 0) {
      setMessage("No user ID saved in local storage");
      return;
    }

    if (profileUserName.trim().length === 0) {
      setMessage("Username cannot be empty");
      return;
    }

    if (profileEmail.trim().length === 0) {
      setMessage("Email cannot be empty");
      return;
    }

    setIsLoading(true);

    const model: DataUpdateModel = {
      collectionName: "users",
      ID: user_id,
      values: {
        username: profileUserName,
        email: profileEmail,
      },
    };

    const response = await RecordController.UpdateData(model);

    if (profilePassword.trim().length > 0) {
      const modelPass: DataUpdateModel = {
        collectionName: "users",
        ID: user_id,
        values: {
          password: profilePassword,
        },
      };

      const responsePass = await RecordController.UpdateData(modelPass);
      setPassword("");

      if (!responsePass.success) {
        setMessage(responsePass.message);
        setIsLoading(false);
        return;
      }
    }

    
    if (profilePicture) {
      try {
        const formData = new FormData();
        formData.append("file", profilePicture);

        const uploadResponse = await FilePluginController.InsertData({file:profilePicture, ref_id: user_id,ref_type: "users" })
       
        if (uploadResponse.success) {
          console.log("Profile picture uploaded successfully:", uploadResponse.data);
        } else {
          throw new Error(uploadResponse.message || "Profile picture upload failed");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setMessage("Error uploading profile picture: " + error.message);
        } else {
          setMessage("An unknown error occurred during upload.");
        }
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);

    if (!response.success) {
      setMessage(response.message);
      return;
    }

    setMessage("Profile updated successfully!");
  };

  return (
    <div className="flex flex-col bg-white p-6 w-full">
      <div className="flex justify-between items-center mb-4 mx-auto">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
      </div>

      {message && <p className="text-green-600 text-lg mb-4 mx-auto">{message}</p>}

      <div onSubmit={handleSubmit} className="space-y-4 flex flex-col items-center w-full">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 mb-4">
          {profilePictureUrl ? (
            <img src={profilePictureUrl} alt="Profile" className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500">
              <span className="text-xl">👤</span>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsPopupOpen(true)}
            className="text-blue-500 underline"
          >
            Edit Profile Picture
          </button>
        </div>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md shadow-md">
              <h2 className="text-xl font-bold mb-2">Edit Profile Picture</h2>
              <input type="file" accept="image/*" onChange={handlePictureChange} />
              <button
                onClick={() => setIsPopupOpen(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 ml-2">
            Username:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={profileUserName}
            onChange={handleInputChange}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileEmail}
            onChange={handleInputChange}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={profilePassword}
            onChange={handleInputChange}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2"
          />
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${
              isLoading ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
