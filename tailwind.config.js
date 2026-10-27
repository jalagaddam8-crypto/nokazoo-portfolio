// Конфиг раньше жил в <script> внутри index.html и spoton.html (Tailwind Play CDN).
// CDN компилировал CSS прямо в браузере на каждое изменение классов, отсюда лаги.
module.exports = {
  content: ['./index.html', './light.html', './spoton.html', './app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        minori: '#E5A823',
        spoton: '#E79A06',
        brandRed: '#E02424',
        honey: '#E79A06',
        crimson: '#E02424',
      },
    },
  },
};
