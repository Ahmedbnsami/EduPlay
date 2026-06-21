import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      "/api": {
        // Proxy API requests to the EduPlay backend to avoid CORS during dev.
        // Uses HTTPS target so the browser communicates with the Vite server only.
        target: "https://eduplayapi.runasp.net",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
