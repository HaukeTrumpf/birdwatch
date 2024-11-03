// generate_descriptions.js
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateDescriptions() {
  const imagesDir = path.join(__dirname, 'public', 'images');
  const descriptionsDir = imagesDir; // Save descriptions in the same folder

  // Get all image files in the directory
  const imageFiles = fs.readdirSync(imagesDir).filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  for (const imageFile of imageFiles) {
    const descriptionFile = path.join(descriptionsDir, `${imageFile}.txt`);

    // Skip if description already exists
    if (fs.existsSync(descriptionFile)) {
      console.log(`Beschreibung für ${imageFile} existiert bereits. Überspringe...`);
      continue;
    }

    const imageUrl = `https://hauke.trumpf.github.io/birdwatch/${imageFile}`;

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

  // Generate images.json file
  const imagesJsonPath = path.join(imagesDir, 'images.json');
  fs.writeFileSync(imagesJsonPath, JSON.stringify(imageFiles));
  console.log('images.json erstellt.');
}

generateDescriptions();
