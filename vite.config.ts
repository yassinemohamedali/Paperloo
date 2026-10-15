import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// Vite Configuration
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: [
        { find: /^@\/src\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
        { find: /^@\/(.*)/, replacement: path.resolve(__dirname, 'src/$1') },
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      force: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
