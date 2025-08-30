// @ts-check
import { defineConfig } from "astro/config";
import decapCmsOauth from "astro-decap-cms-oauth";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server", // Required for OAuth and API endpoints
  adapter: vercel(),
  integrations: [decapCmsOauth(), react()],
  server: {
    host: true, // Allow external connections
    allowedHosts: ["2d208b860f07.ngrok-free.app", "localhost", "127.0.0.1"],
  },
  vite: {
    define: {
      // Make environment variables available at build time if needed
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development"
      ),
    },
  },
});
