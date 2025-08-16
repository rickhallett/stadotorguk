// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  server: {
    allowedHosts: ["localhost", "127.0.0.1", "e1e39e607c51.ngrok-free.app"],
  },
});
