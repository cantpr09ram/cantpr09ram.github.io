import type { Font } from "satori";

let cache: Font[] | null = null;

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
	const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
	const css = await fetch(url, {
		headers: { "User-Agent": "Mozilla/5.0 (compatible; OGImageGen)" },
	}).then((r) => r.text());
	const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
	if (!match) throw new Error(`Could not parse font URL for ${family} ${weight}`);
	return fetch(match[1]).then((r) => r.arrayBuffer());
}

export async function loadFonts(): Promise<Font[]> {
	if (cache) return cache;
	const [reg, bold, cjk] = await Promise.all([
		fetchFont("EB Garamond", 400),
		fetchFont("EB Garamond", 700),
		fetchFont("Noto Serif TC", 400),
	]);
	cache = [
		{ name: "EB Garamond", data: reg, weight: 400, style: "normal" },
		{ name: "EB Garamond", data: bold, weight: 700, style: "normal" },
		{ name: "Noto Serif TC", data: cjk, weight: 400, style: "normal" },
	];
	return cache;
}
