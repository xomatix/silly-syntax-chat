import React, {useState} from 'react';
import { FilePluginController } from '../controllers/FilePluginController';
import { FileInsertModel, ResponseMessage } from '../controllers/Types';
const ImageUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const file = event.target.files[0];
        setSelectedFile(file);
      }
    };

    const handleUpload = async (event: React.FormEvent) => {
      event.preventDefault();
  
      if (!selectedFile) {
        setUploadStatus('Please select an image first.');
        return;
      }
      

        let user_id = Number(localStorage.getItem("bonanza_user_id"));
        
        let model: FileInsertModel = {
            file: selectedFile,
            ref_type: 'users',
            ref_id: user_id
        }
        
        try {
            setUploadStatus('Uploading...');

        const response:ResponseMessage= await FilePluginController.InsertData(model);
  
  
        if (response.success) {
          setUploadStatus('Upload successful!');
        } else {
          setUploadStatus('Upload failed. Please try again.');
        }
      } catch (error:unknown) {
        setUploadStatus(`Error: `);
      }
    };
  
    return (
      <div>
        <h1>Upload Your Image</h1>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          <button type="submit">Upload</button>
        </form>
  
        {uploadStatus && <p>{uploadStatus}</p>}
  
        {uploadedImageUrl && (
          <div>
            <h2>Uploaded Image:</h2>
            <img src={uploadedImageUrl} alt="Uploaded" style={{ width: '300px' }} />
          </div>
        )}
      </div>
    );
  };
  
  export default ImageUpload;