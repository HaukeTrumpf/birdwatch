// src/components/ImageUploader.tsx
import React, { useEffect, useState } from 'react';

const ImageUploader: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    // Import all images from src/assets using Vite's import.meta.glob
    const importAllImages = () => {
      const images = import.meta.glob('../assets/*.{jpg,jpeg,png}', { eager: true });
      const imageUrls = Object.values(images).map((module: any) => module.default);

      setUploadedImages(imageUrls);
    };

    importAllImages();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {uploadedImages.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Captured bird ${index}`}
            className="w-full h-auto rounded-lg shadow"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
