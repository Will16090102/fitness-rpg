import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Ruta base = nombre del repositorio en GitHub Pages
export default defineConfig({ base: '/fitness-rpg/', plugins: [react()] });
