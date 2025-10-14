import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
<<<<<<< HEAD
  base: mode === 'development' ? '/' : './',
=======
>>>>>>> sumber/main
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
<<<<<<< HEAD
    dedupe: [
      'react', 
      'react-dom',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot'
    ],
=======
>>>>>>> sumber/main
  },
}));
