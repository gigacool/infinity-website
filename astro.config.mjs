import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://noosia.digital",
  output: "server",
  adapter: vercel(),
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: {
          fr: 'fr-FR',
          en: 'en-US',
        },
      },
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/confirmation') &&
        !page.includes('/404'),
    }),
    icon(),
    preact(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
