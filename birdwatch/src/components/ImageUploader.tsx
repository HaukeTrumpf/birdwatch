// src/components/ImageUploader.tsx
import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Set the preview URL for immediate display
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('YOUR_BACKEND_ENDPOINT_URL', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add the preview URL to the list of uploaded images
      setUploadedImages((prev) => [...prev, previewUrl!]);
      console.log('Image uploaded successfully:', response.data);
      setSelectedImage(null); // Clear the selected image after upload
      setPreviewUrl(null);    // Clear the preview URL after upload
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Upload an Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} className="mb-4" />

      {previewUrl && (
        <div className="mb-4">
          <img src={previewUrl} alt="Selected" className="w-full h-auto rounded-lg shadow mb-2" />
          <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
            Upload Image
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {uploadedImages.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Uploaded ${index}`}
            className="w-full h-auto rounded-lg shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
