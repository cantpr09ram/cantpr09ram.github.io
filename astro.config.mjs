// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeAdmonitions from "./src/plugins/rehype-admonitions.mjs";

// https://astro.build/config
export default defineConfig({
	site: "https://cantpr09ram.github.io",
	integrations: [
		mdx({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}), 
		sitemap(), 
		react()],
	markdown: {
		syntaxHighlight: "shiki",
		shikiConfig: {
			themes: {
				light: "github-light",
				dark: "github-dark",
			},
		},
		rehypePlugins: [rehypeAdmonitions],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
