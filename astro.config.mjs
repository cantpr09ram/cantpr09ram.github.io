// @ts-check

import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import rehypeCallouts from "rehype-callouts";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
	site: "https://cantpr09ram.cc",
	integrations: [mdx(), sitemap(), react()],
	markdown: {
		processor: unified({
			gfm: true,
			remarkPlugins: [remarkMath],
			rehypePlugins: [
				rehypeKatex,
				[rehypeCallouts, { theme: "github" }],
			],
		}),
		syntaxHighlight: "shiki",
		shikiConfig: {
			themes: {
				light: "github-light",
				dark: "github-dark",
			},
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
