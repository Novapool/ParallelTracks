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
        // AI Model Colors (Pixel Art Theme)
        anthropic: '#e76f51',
        'anthropic-dark': '#c55f41',
        gpt: '#2a9d8f',
        'gpt-dark': '#1a7d6f',
        gemini: '#e9c46a',
        'gemini-dark': '#d9b45a',
        grok: '#f4a261',
        'grok-dark': '#e49251',
        deepseek: '#264653',
        'deepseek-dark': '#163643',

        // Pixel Art Theme Colors
        'pixel-bg': '#0f0f1e',
        'pixel-bg-secondary': '#1a1a2e',
        'pixel-bg-tertiary': '#16213e',
        'pixel-text': '#f1faee',
        'pixel-text-secondary': '#a8dadc',
        'pixel-border': '#457b9d',
        'pixel-accent': '#f72585',
        'pixel-success': '#06ffa5',
        'pixel-error': '#ff006e',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        retro: ['VT323', 'monospace'],
      },
      boxShadow: {
        'pixel-sm': '4px 4px 0px rgba(0, 0, 0, 0.8)',
        'pixel': '8px 8px 0px rgba(0, 0, 0, 0.8)',
        'pixel-lg': '12px 12px 0px rgba(0, 0, 0, 0.8)',
        'glow-anthropic': '0 0 20px rgba(231, 111, 81, 0.6)',
        'glow-gpt': '0 0 20px rgba(42, 157, 143, 0.6)',
        'glow-gemini': '0 0 20px rgba(233, 196, 106, 0.6)',
        'glow-grok': '0 0 20px rgba(244, 162, 97, 0.6)',
        'glow-deepseek': '0 0 20px rgba(38, 70, 83, 0.6)',
      },
      transitionTimingFunction: {
        'pixel': 'steps(20)',
      },
    },
  },
  plugins: [],
}
