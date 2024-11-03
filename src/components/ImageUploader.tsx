// src/components/ImageUploader.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ImageUploader: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const piServerUrl = 'http://birdwatch.local/images/';

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Fetch the directory listing as plain text
        const response = await axios.get(piServerUrl);

        // Extract filenames by parsing the response text
        const imageUrls = response.data
          .split('\n')
          .filter((line: string) => line.includes('.jpg'))
          .map((line: string) => {
            const fileName = line.match(/href="([^"]+\.(jpg|jpeg|png))"/i);
            return fileName ? `${piServerUrl}${fileName[1]}` : null;
          })
          .filter((url: string | null) => url !== null) as string[];

        setUploadedImages(imageUrls);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();

    // Optional: Poll for new images every 60 seconds
    const interval = setInterval(fetchImages, 60000);
    return () => clearInterval(interval);
  }, [piServerUrl]);

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
