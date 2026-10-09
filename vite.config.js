import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

//vitejs.dev/config/
https: export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000'
    }
  }
});
