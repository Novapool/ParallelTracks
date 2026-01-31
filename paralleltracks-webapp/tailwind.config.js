/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        anthropic: '#D97757',
        gpt: '#74AA9C',
        gemini: '#4285F4',
        grok: '#000000',
        deepseek: '#6366F1',
      },
    },
  },
  plugins: [],
}
