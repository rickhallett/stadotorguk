// @ts-check
import { defineConfig } from "astro/config";
import decapCmsOauth from "astro-decap-cms-oauth";
import node from "@astrojs/node";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server", // Use server mode for OAuth integration
  adapter: vercel({}),
  integrations: [decapCmsOauth()],
  server: {
    host: true, // Allow external connections
    allowedHosts: ["2d208b860f07.ngrok-free.app", "localhost", "127.0.0.1"],
  },
});
