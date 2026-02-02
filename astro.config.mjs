import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://astroship.web3templates.com",
  output: "server",
  adapter: vercel(),
  integrations: [mdx(), sitemap(), icon(), preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
