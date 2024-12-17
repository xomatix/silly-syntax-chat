import { useState, useEffect } from "react";
import { DataUpdateModel, UserModel } from "../controllers/Types";
import { RecordController } from "../controllers/RecordController";
import PictureEdit from "./PictureEdit"; // Assume this is a component for editing profile picture

interface ProfileSettingsProps {
  onClose: () => void;
}


const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
  const [profileUserName, setUserName] = useState<string>("");
  const [profileEmail, setEmail] = useState<string>("");
  const [profilePassword, setPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const user_id = Number(localStorage.getItem("bonanza_user_id"));

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

      const userData: UserModel = response.data[0];
      if (userData.id !== user_id) {
        console.log("User data mismatch");
        return;
      }

      setUserName(userData.username);
      setEmail(userData.email);
      setPassword(userData.password);
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
    if (e.target.files) {
      setProfilePicture(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user_id <= 0) {
      alert("No user ID saved in local storage");
      return;
    }

    if (profileUserName.trim().length === 0) {
      alert("Username cannot be empty");
      return;
    }

    if (profileEmail.trim().length === 0) {
      alert("Email cannot be empty");
      return;
    }

    if (profilePassword.trim().length === 0) {
      alert("Password cannot be empty");
      return;
    }

    setIsLoading(true);  // Set loading to true when submitting

    const model: DataUpdateModel = {
      collectionName: "users",
      ID: user_id,
      values: {
        username: profileUserName,
        email: profileEmail,
        password: profilePassword,
        profilePicture: profilePicture, // You can handle the picture upload here
      },
    };

    const response = await RecordController.UpdateData(model);

    setIsLoading(false);  // Set loading to false after submission

    if (!response.success) {
      alert(response.message);
      return;
    }

    setMessage("Profile updated successfully!");
    setTimeout(() => {
      onClose(); // Close the popup after a successful update
    }, 2000); // Wait 2 seconds before closing
  };

  return (
    <div className="flex flex-col bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Edit Profile</h2>
        
      </div>

      {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={profilePassword}
            onChange={handleInputChange}
            className="flex items-center bg-gray-100 rounded-full px-4 py-2"
            required
          />
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
            className=""
          />
          {profilePicture && (
            <div className="mt-2 text-sm text-gray-600">
              Selected file: {profilePicture.name}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${isLoading ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
