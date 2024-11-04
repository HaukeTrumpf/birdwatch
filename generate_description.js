import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import fetch from 'node-fetch';  // Stelle sicher, dass node-fetch installiert ist

if (!process.env.OPENAI_API_KEY) {
  console.error('Fehler: OPENAI_API_KEY ist nicht gesetzt.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function checkUrlExists(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function generateDescriptions() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const imagesDir = path.join(__dirname, 'public', 'images');
  const publicDir = path.join(__dirname, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const descriptionsPath = path.join(publicDir, 'descriptions.json');
  const imagesJsonPath = path.join(publicDir, 'images.json');

  let descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'))
    : {};

  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  const imagePaths = imageFiles.map((file) => `images/${file}`);

  let hasNewDescriptions = false;

  for (const imageFile of imageFiles) {
    if (descriptions[imageFile]) {
      console.log(`Beschreibung für ${imageFile} existiert bereits. Überspringe...`);
      continue;
    }

    const imageUrl = `https://hauketrumpf.github.io/birdwatch/images/${imageFile}`;

    // URL-Verfügbarkeit prüfen
    const urlExists = await checkUrlExists(imageUrl);
    if (!urlExists) {
      console.log(`Bild-URL für ${imageFile} ist noch nicht verfügbar. Überspringe...`);
      continue;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "einfach nur der name des tieres und die gattung, mehr nicht ohne punkt beenden" },
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
      hasNewDescriptions = true;
      console.log(`Beschreibung für ${imageFile} gespeichert.`);
    } catch (error) {
      console.error(`Fehler bei ${imageFile}:`, error.response?.data || error.message);
    }
  }

  if (hasNewDescriptions) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
    console.log('descriptions.json aktualisiert.');
  }

  fs.writeFileSync(imagesJsonPath, JSON.stringify(imagePaths, null, 2));
  console.log('images.json aktualisiert.');
}

generateDescriptions();
