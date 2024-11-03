// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",           // If you have an index.html at the root
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust the path based on where your components are located
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
