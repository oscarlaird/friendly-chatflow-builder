import { defineConfig } from '@ladle/react';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  stories: ['./src/**/*.stories.@(tsx|ts|mdx)'],
  vite: {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss('./tailwind.config.ts'), autoprefixer()],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
});