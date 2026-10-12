import { defineConfig } from 'vite';
import { copyFileSync, readdirSync, mkdirSync } from 'node:fs';

// Copies photos kept next to index.html (nominee-01.jpg etc.) into the built site,
// so every project file can live in one flat folder.
const copyPhotos = () => ({
  name: 'copy-photos',
  closeBundle() {
    mkdirSync('dist', { recursive: true });
    readdirSync('.')
      .filter((file) => /\.(jpe?g|png|webp|gif)$/i.test(file))
      .forEach((file) => copyFileSync(file, `dist/${file}`));
  },
});

// base './' lets the built site work from any path, including GitHub Pages.
export default defineConfig({ base: './', plugins: [copyPhotos()] });
