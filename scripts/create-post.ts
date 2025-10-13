// create-post.ts
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import consola from "consola";

createPost().catch((err) =>
	consola.error(err instanceof Error ? err.message : String(err)),
);

async function createPost(): Promise<void> {
	consola.start("Create a new post");

	const filename: string = await consola.prompt("Enter file name:", {
		type: "text",
	});
	const extension: string = await consola.prompt("Select file extension:", {
		type: "select",
		options: [".md", ".mdx"],
	});

	const targetRoot = "./src/content/blog";
	const slug = toSlug(filename);
	const postDir = path.join(targetRoot, slug);
	const fullPath = path.join(postDir, `page${extension}`);

	const frontmatter = getFrontmatter({
		title: escapeYAML(filename),
		pubDate: currentDate(), // YYYY-MM-DD，未使用 dayjs
		categories: "[]", // 空陣列
		description: "''", // 空字串
		slug: slug,
	});

	try {
		fs.mkdirSync(postDir, { recursive: true });
		fs.writeFileSync(fullPath, frontmatter, "utf8");
		consola.success(`Created: ${fullPath}`);

		const open: boolean = await consola.prompt("Open the new post?", {
			type: "confirm",
			initial: true,
		});
		if (open) {
			consola.info(`Opening ${fullPath}...`);
			execSync(`code "${fullPath}"`);
		}
	} catch (error) {
		consola.error((error as Error).message || "Failed to create new post");
	}
}

/** Helpers */
function toSlug(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

function currentDate(): string {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function escapeYAML(val: string): string {
	// 單行且不含特殊字元時直接輸出，否則用引號包裹
	if (/^[A-Za-z0-9 _-]+$/.test(val)) return val;
	return JSON.stringify(val);
}

function getFrontmatter(data: { [key: string]: string }): string {
	const body = Object.entries(data)
		.map(([k, v]) => `${k}: ${v}`)
		.join("\n");
	return `---\n${body}\n---\n\n`;
}
