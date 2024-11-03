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
        // Fetch the images.json file to get the list of image filenames
        const response = await fetch('/birdwatch/images.json');
        const imageFilenames: string[] = await response.json();

        const imageData: ImageData[] = imageFilenames.map((filename) => {
          const url = `/birdwatch/${filename}`;
          const descriptionUrl = `/birdwatch/${filename}.txt`;
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

  const handleRegenerateDescription = async (image: ImageData) => {
    // Da wir den API-Schlüssel nicht im Client-Code verwenden können, können wir hier einen manuellen Workflow auslösen
    alert('Die Neugenerierung der Beschreibung ist nicht direkt verfügbar.');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-3 gap-4">
        {imagesWithDescriptions.map((item, index) => (
          <div key={index} className="image-container">
            <img src={item.url} alt={`Captured bird ${index}`} className="w-full h-auto rounded-lg shadow" />
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{item.description}</p>
            <button
              onClick={() => handleRegenerateDescription(item)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Beschreibung neu generieren
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageUploader;
