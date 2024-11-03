import React, { useEffect, useState } from 'react';

interface ImageData {
  url: string;
  descriptionUrl: string;
  description: string;
}

const ImageUploader: React.FC = () => {
  const [imagesWithDescriptions, setImagesWithDescriptions] = useState<ImageData[]>([]);

  useEffect(() => {
    const loadImagesAndDescriptions = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        console.log('Base URL:', baseUrl);

        // Fetch the images.json file to get the list of image filenames
        const imagesJsonUrl = `${baseUrl}images.json`;
        console.log('Fetching images.json from:', imagesJsonUrl);

        const response = await fetch(imagesJsonUrl);
        if (!response.ok) {
          console.error('Failed to fetch images.json:', response.statusText);
          return;
        }
        const imageFilenames: string[] = await response.json();
        console.log('Image filenames:', imageFilenames);

        const imageData: ImageData[] = imageFilenames.map((filename) => {
          const url = `${baseUrl}${filename}`;
          const descriptionUrl = `${url}.txt`;
          return { url, descriptionUrl, description: '' };
        });

        // Load descriptions
        const dataWithDescriptions = await Promise.all(
          imageData.map(async (item) => {
            try {
              const response = await fetch(item.descriptionUrl);
              if (response.ok) {
                const description = await response.text();
                return { ...item, description };
              } else {
                return { ...item, description: 'Keine Beschreibung verfügbar.' };
              }
            } catch (error) {
              console.error(`Fehler beim Laden der Beschreibung für ${item.url}:`, error);
              return { ...item, description: 'Fehler beim Laden der Beschreibung.' };
            }
          })
        );

        setImagesWithDescriptions(dataWithDescriptions);
      } catch (error) {
        console.error('Fehler beim Laden der Bilder:', error);
      }
    };

    loadImagesAndDescriptions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {imagesWithDescriptions.map((item, index) => (
          <div key={index} className="image-container">
            <img
              src={item.url}
              alt={`Image ${index}`}
              className="w-full h-auto rounded-lg shadow"
            />
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
