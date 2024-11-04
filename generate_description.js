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

  // Longer delay to ensure URLs are accessible
  console.log("Waiting for images to be accessible online...");
  await delay(20000);  // 20-second delay

  let hasNewDescriptions = false;

  for (const imageFile of imageFiles) {
    if (descriptions[imageFile]) {
      console.log(`Description for ${imageFile} already exists. Skipping...`);
      continue;
    }

    const imageUrl = `https://hauketrumpf.github.io/birdwatch/images/${imageFile}`;
    console.log(`Processing image: ${imageUrl}`);

    // Retry mechanism for unreliable image loading
    let retries = 3;
    while (retries > 0) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: `Please provide the name and species in the following format "name", "species": ${imageUrl}` }
          ],
        });

        const description = response.choices[0].message.content.trim();
        console.log(`Received description for ${imageFile}: ${description}`);
        descriptions[imageFile] = description;
        hasNewDescriptions = true;
        break;  // Success, exit the retry loop
      } catch (error) {
        retries--;
        console.error(`Error with ${imageFile}, ${retries} retries left:`, error.response?.data || error.message);
        if (retries > 0) await delay(5000);  // Retry delay
      }
    }

    // Fallback if all retries fail
    if (!descriptions[imageFile]) {
      descriptions[imageFile] = "Keine Beschreibung verfügbar.";
    }
  }

  // Save descriptions if new ones were added
  if (hasNewDescriptions) {
    fs.writeFileSync(descriptionsPath, JSON.stringify(descriptions, null, 2));
    console.log('descriptions.json updated with new descriptions.');
  }
}

generateDescriptions();
