import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  // Relative asset paths make the app work at a GitHub Pages project URL.
  base: "./",
  plugins: [react()],
});
