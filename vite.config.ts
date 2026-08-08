import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

// STEALTH-OPS: Custom Rollup chunking and build pipeline obfuscation to eliminate default framework fingerprints
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      force: true,
    },
    build: {
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // STEALTH-OPS: Camouflage output assets into custom enterprise directory structures instead of default /assets/
          entryFileNames: '_core/bin/[name]-[hash].js',
          chunkFileNames: '_core/modules/[name]-[hash].js',
          assetFileNames: '_core/styles/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) return 'sys-vendor-core';
              if (id.includes('@supabase') || id.includes('ogl')) return 'sys-vendor-gfx';
              return 'sys-vendor-lib';
            }
          }
        }
      }
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
