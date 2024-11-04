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
  const imagesDir = path.join(__dirname, 'public', 'images'); // Greift auf public/images zu
  const publicDir = path.join(__dirname, 'public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const descriptionsPath = path.join(publicDir, 'descriptions.json');
  const imagesJsonPath = path.join(publicDir, 'images.json');

  // Load existing descriptions if they exist
  let descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'))
    : {};

  // Retrieve all image files in public/images
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  // Create image paths for images.json
  const imagePaths = imageFiles.map((file) => `images/${file}`);

  let hasNewDescriptions = false; // Track if we added new descriptions

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
          { role: "user", content: `Beschreibe das Bild mit dem Tier: ${imageUrl}` },
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

  // Save descriptions.json only if new descriptions were added
  if (hasNewDescriptions) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
    console.log('descriptions.json aktualisiert.');
  }

  // Update images.json regardless, in case new images were added
  fs.writeFileSync(imagesJsonPath, JSON.stringify(imagePaths, null, 2));
  console.log('images.json aktualisiert.');
}

generateDescriptions();
