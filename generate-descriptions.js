// Import necessary modules
import 'dotenv/config'; // Automatically loads environment variables from .env
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4', // Use 'gpt-4' if you have access
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please provide a detailed description of the following image.',
            },
            {
              type: 'image_url',
              image_url: {
                url: 'https://hauketrumpf.github.io/birdwatch/vite.svg',
              },
            },
          ],
        },
      ],
    });
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

main();
