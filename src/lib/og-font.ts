import { readFile } from "node:fs/promises";
import type { Font } from "satori";

let cache: Font[] | null = null;
const LOCAL_FALLBACK_FONT_CANDIDATES = [
	process.env.OG_FALLBACK_FONT_PATH,
	"/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
	"/System/Library/Fonts/Supplemental/Arial.ttf",
	"/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
	"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
].filter((path): path is string => Boolean(path));

async function loadLocalFallbackFont(): Promise<ArrayBuffer> {
	for (const path of LOCAL_FALLBACK_FONT_CANDIDATES) {
		try {
			const data = await readFile(path);
			return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
		} catch {
			// Try next candidate.
		}
	}
	throw new Error(
		`Could not load any local fallback font. Checked: ${LOCAL_FALLBACK_FONT_CANDIDATES.join(", ")}`,
	);
}

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
	const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
	const cssResponse = await fetch(url, {
		headers: { "User-Agent": "Mozilla/5.0 (compatible; OGImageGen)" },
	});
	if (!cssResponse.ok) {
		throw new Error(`Failed to load font stylesheet for ${family} ${weight}: ${cssResponse.status}`);
	}
	const css = await cssResponse.text();
	const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
	if (!match) throw new Error(`Could not parse font URL for ${family} ${weight}`);
	const fontResponse = await fetch(match[1]);
	if (!fontResponse.ok) {
		throw new Error(`Failed to download font binary for ${family} ${weight}: ${fontResponse.status}`);
	}
	return fontResponse.arrayBuffer();
}

export async function loadFonts(): Promise<Font[]> {
	if (cache) return cache;
	try {
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
	} catch (error) {
		// Keep OG generation working in offline/CI environments where google fonts are blocked.
		console.warn("Failed to fetch remote OG fonts. Falling back to a local system font.", error);
		const fallback = await loadLocalFallbackFont();
		cache = [
			{ name: "EB Garamond", data: fallback, weight: 400, style: "normal" },
			{ name: "EB Garamond", data: fallback, weight: 700, style: "normal" },
			{ name: "Noto Serif TC", data: fallback, weight: 400, style: "normal" },
		];
	}
	return cache;
}
