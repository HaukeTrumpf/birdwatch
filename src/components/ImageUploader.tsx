// src/components/ImageUploader.tsx
import React, { useEffect, useState } from 'react';

const ImageUploader: React.FC = () => {
  const [imagesWithDescriptions, setImagesWithDescriptions] = useState<{ url: string, description: string }[]>([]);

  useEffect(() => {
    // Import all images and corresponding text files from src/assets
    const loadImagesAndDescriptions = () => {
      const images = import.meta.glob<{ default: string }>('../assets/*.{jpg,jpeg,png}', { eager: true });
      const descriptions = import.meta.glob<{ default: string }>('../assets/*.txt', { eager: true });

      // Map each image to its corresponding description file
      const imageData = Object.keys(images).map((imagePath) => {
        const descriptionPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.txt');
        const description = descriptions[descriptionPath]?.default || 'No description available.';
        
        return { url: images[imagePath].default, description };
      });

      setImagesWithDescriptions(imageData);
    };

    loadImagesAndDescriptions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {imagesWithDescriptions.map((item, index) => (
          <div key={index} className="image-container">
            <img src={item.url} alt={`Captured bird ${index}`} className="w-full h-auto rounded-lg shadow" />
            <p className="mt-2 text-gray-700">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
