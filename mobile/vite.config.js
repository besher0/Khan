import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.web.js', '.web.jsx', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: [{ find: 'react-native', replacement: 'react-native-web' }],
  },
});
