// generate_description.js
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('Fehler: OPENAI_API_KEY ist nicht gesetzt.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateDescriptions() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);

  const imagesDir = path.join(__dirname, 'public', 'images');
  const publicDir = path.join(__dirname, 'public');

  // Alle Bilddateien im Verzeichnis abrufen
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  // Bildpfade erstellen
  const imagePaths = imageFiles.map((file) => `images/${file}`);

  let descriptions = {};

  const descriptionsPath = path.join(publicDir, 'descriptions.json');

  if (fs.existsSync(descriptionsPath)) {
    descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));
  }

  for (const imageFile of imageFiles) {
    if (descriptions[imageFile]) {
      console.log(`Beschreibung für ${imageFile} existiert bereits. Überspringe...`);
      continue;
    }

    const imageUrl = `https://hauketrumpf.github.io/birdwatch/images/${imageFile}`;

    try {

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Was siehst du? was hast du für informationen, wie sieht die url aus, die du bekommen hast" },
              {
                type: "image_url",
                image_url: {
                  "url": imageUrl,
                },
              },
            ],
          },
        ],
      });

      const description = response.choices[0].message.content.trim();

      descriptions[imageFile] = description;
      console.log(`Beschreibung für ${imageFile} gespeichert.`);
    } catch (error) {
      console.error(`Fehler bei ${imageFile}:`, error.response?.data || error.message);
    }
  }

  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
  console.log('descriptions.json erstellt.');

  // images.json im public-Verzeichnis speichern
  const imagesJsonPath = path.join(publicDir, 'images.json');
  fs.writeFileSync(imagesJsonPath, JSON.stringify(imagePaths, null, 2));
  console.log('images.json erstellt.');
}

generateDescriptions();
