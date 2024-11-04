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

// Function to add a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function generateDescriptions() {
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const imagesDir = path.join(__dirname, 'public', 'images');
  const publicDir = path.join(__dirname, 'public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  const descriptionsPath = path.join(publicDir, 'descriptions.json');
  const imagesJsonPath = path.join(publicDir, 'images.json');

  // Load existing descriptions
  let descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'))
    : {};

  // Fetch all current image files in public/images
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  // Update images.json with the complete list of images
  const imagePaths = imageFiles.map((file) => `images/${file}`);
  fs.writeFileSync(imagesJsonPath, JSON.stringify(imagePaths, null, 2));
  console.log('images.json updated with all current images.');

  // Remove deleted images from descriptions.json
  const updatedDescriptions = {};
  for (const file of imageFiles) {
    if (descriptions[file]) {
      updatedDescriptions[file] = descriptions[file]; // Retain description if image exists
    }
  }
  descriptions = updatedDescriptions;
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
  console.log('descriptions.json updated with descriptions for current images only.');

  // Add delay to allow GitHub Pages to publish new images
  console.log("Waiting for images to be available online...");
  await delay(10000);  // 10-second delay

  let hasNewDescriptions = false;

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
          { role: "user", content: `Please describe the animal in the image: ${imageUrl}` }
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
    console.log('descriptions.json updated with new descriptions.');
  }
}

generateDescriptions();
