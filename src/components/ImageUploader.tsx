import React, { useEffect, useState } from 'react';

interface ImageData {
  url: string;
  description: string;
  filename: string;
}

const ImageUploader: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const loadImagesAndDescriptions = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL;

        // Laden der descriptions.json
        const descriptionsResponse = await fetch(`${baseUrl}descriptions.json`);
        const descriptionsData = await descriptionsResponse.json();

        // Laden der images.json
        const imagesResponse = await fetch(`${baseUrl}images.json`);
        const imageFilenames: string[] = await imagesResponse.json();

        const imagesData: ImageData[] = imageFilenames.map((filename) => ({
          url: `${baseUrl}${filename}`,
          description: descriptionsData[filename.split('/').pop() || ''] || 'Keine Beschreibung verfügbar.',
          filename,
        }));

        setImages(imagesData);
      } catch (error) {
        console.error('Fehler beim Laden der Bilder oder Beschreibungen:', error);
      }
    };

    loadImagesAndDescriptions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {images.map((item, index) => (
          <div key={index} className="image-container">
            <img
              src={item.url}
              alt={`Image ${index}`}
              className="w-full h-auto rounded-lg shadow"
              onError={() => {
                console.error('Image failed to load:', item.url);
              }}
            />
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
