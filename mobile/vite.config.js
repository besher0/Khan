import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const resolveFromRoot = (...parts) => path.resolve(rootDir, ...parts);
const reactNativeWebPath = resolveFromRoot('node_modules/react-native-web');
const safeAreaContextPath = resolveFromRoot('node_modules/react-native-safe-area-context/lib/module');

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.web.js', '.web.jsx', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: [
      {
        find: 'react-native/Libraries/Utilities/codegenNativeComponent',
        replacement: resolveFromRoot('src/shims/codegenNativeComponent.js'),
      },
      {
        find: /^react-native\/(.*)$/,
        replacement: `${reactNativeWebPath}/$1`,
      },
      {
        find: 'react-native',
        replacement: reactNativeWebPath,
      },
      {
        find: `${safeAreaContextPath}/SafeAreaView.js`,
        replacement: `${safeAreaContextPath}/SafeAreaView.web.js`,
      },
      {
        find: `${safeAreaContextPath}/NativeSafeAreaProvider.js`,
        replacement: `${safeAreaContextPath}/NativeSafeAreaProvider.web.js`,
      },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: ['.web.js', '.web.jsx', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    },
  },
});
