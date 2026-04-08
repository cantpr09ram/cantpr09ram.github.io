import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";
import satori from "satori";
import { SITE_TITLE } from "../../consts";
import { loadFonts } from "../../lib/og-font";
import { OgTemplate } from "../../lib/og-template";

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getCollection("blog");
	return posts.map((post) => ({
		params: { slug: post.id },
		props: {
			title: post.data.title,
			description: post.data.description ?? "",
		},
	}));
};

export const GET: APIRoute = async ({ props }) => {
	const { title, description } = props as { title: string; description: string };
	const fonts = await loadFonts();

	const svg = await satori(
		createElement(OgTemplate, { title, description, siteName: SITE_TITLE }),
		{ width: 1200, height: 630, fonts },
	);

	const png = new Resvg(svg, { font: { loadSystemFonts: false } })
		.render()
		.asPng();

	return new Response(png, {
		headers: {
			"Content-Type": "image/png",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
