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

  // Initialize descriptions from existing file or as an empty object
  let descriptions = fs.existsSync(descriptionsPath)
    ? JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'))
    : {};

  // Get current images in public/images
  const imageFiles = fs
    .readdirSync(imagesDir)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  // Update images.json with the complete list of current images
  const imagePaths = imageFiles.map((file) => `images/${file}`);
  fs.writeFileSync(imagesJsonPath, JSON.stringify(imagePaths, null, 2));
  console.log('images.json updated with current images.');

  // Remove descriptions for deleted images
  const updatedDescriptions = {};
  for (const file of imageFiles) {
    if (descriptions[file]) {
      updatedDescriptions[file] = descriptions[file];
    }
  }
  descriptions = updatedDescriptions;
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
  console.log('descriptions.json updated to remove descriptions for deleted images.');

  // Wait for GitHub Pages to publish new images
  console.log("Waiting for images to be accessible online...");
  await delay(15000);  // 15-second delay

  let hasNewDescriptions = false;

  for (const imageFile of imageFiles) {
    if (descriptions[imageFile]) {
      console.log(`Description for ${imageFile} already exists. Skipping...`);
      continue;
    }

    const imageUrl = `https://hauketrumpf.github.io/birdwatch/images/${imageFile}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: `bitte nenne name und gattung des tieres wie folgt "name", "gattung": ${imageUrl}` }
        ],
      });

      const description = response.choices[0].message.content.trim();
      descriptions[imageFile] = description;
      hasNewDescriptions = true;
      console.log(`Description for ${imageFile} saved.`);
    } catch (error) {
      console.error(`Error with ${imageFile}:`, error.response?.data || error.message);
    }
  }

  // Save descriptions if new ones were added
  if (hasNewDescriptions) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
    console.log('descriptions.json updated with new descriptions.');
  }

  // Final synchronization check to ensure all images in images.json have a description
  for (const file of imageFiles) {
    if (!descriptions[file]) {
      descriptions[file] = "Keine Beschreibung verfügbar.";
    }
  }
  fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
  console.log('descriptions.json synchronized with all images.');
}

generateDescriptions();
