// generate_descriptions.js
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Überprüfen, ob der API-Schlüssel vorhanden ist
if (!process.env.OPENAI_API_KEY) {
  console.error('Fehler: OPENAI_API_KEY ist nicht gesetzt.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateDescriptions() {
  const imagesDir = path.join(__dirname, 'public', 'images');
  const publicDir = path.join(__dirname, 'public');

  // Alle Bilddateien im Verzeichnis abrufen
  const imageFiles = fs.readdirSync(imagesDir).filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  // Bildpfade erstellen
  const imagePaths = imageFiles.map((file) => `images/${file}`);

  for (const imageFile of imageFiles) {
    const descriptionFile = path.join(imagesDir, `${imageFile}.txt`);

    // Überspringen, wenn die Beschreibung bereits existiert
    if (fs.existsSync(descriptionFile)) {
      console.log(`Beschreibung für ${imageFile} existiert bereits. Überspringe...`);
      continue;
    }

    const imageUrl = `https://hauke.trumpf.github.io/birdwatch/images/${imageFile}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `Bitte geben Sie eine detaillierte Beschreibung des folgenden Bildes: ${imageUrl}`,
          },
        ],
      });

      const description = response.choices[0].message.content.trim();

      fs.writeFileSync(descriptionFile, description);
      console.log(`Beschreibung für ${imageFile} gespeichert.`);
    } catch (error) {
      console.error(`Fehler bei ${imageFile}:`, error.response?.data || error.message);
    }
  }

  // images.json im public-Verzeichnis speichern
  const imagesJsonPath = path.join(publicDir, 'images.json');
  fs.writeFileSync(imagesJsonPath, JSON.stringify(imagePaths));
  console.log('images.json erstellt.');
}

generateDescriptions();
