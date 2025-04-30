import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path'; // Add path import

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/lib/**/*', 'src/index.ts'],
      outDir: 'dist/types'
    })
  ],
  build: {
    lib: {
      entry: resolve('src/index.ts'), // Changed from src/lib/index.ts
      name: 'AccountSelector',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'style.css';
          return assetInfo.name || 'asset-[hash]'; // Added fallback string
        }
      }
    },
    sourcemap: true,
    cssCodeSplit: true, // Changed from false to true
  }
});