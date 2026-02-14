const ADMONITION_TYPES = new Set([
	"note",
	"tip",
	"important",
	"caution",
	"warning",
]);

const DEFAULT_TITLES = {
	note: "Note",
	tip: "Tip",
	important: "Important",
	caution: "Caution",
	warning: "Warning",
};

function isElement(node, tagName) {
	return node?.type === "element" && node.tagName === tagName;
}

function getText(node) {
	if (!node) {
		return "";
	}

	if (node.type === "text") {
		return node.value;
	}

	if (isElement(node, "br")) {
		return "\n";
	}

	if (!Array.isArray(node.children)) {
		return "";
	}

	return node.children.map(getText).join("");
}

function makeTextParagraph(value) {
	return {
		type: "element",
		tagName: "p",
		properties: {},
		children: [{ type: "text", value }],
	};
}

function makeAdmonition(type, title, children) {
	return {
		type: "element",
		tagName: "div",
		properties: {
			className: ["admonition"],
			"data-admonition-type": type,
		},
		children: [
			{
				type: "element",
				tagName: "p",
				properties: { className: ["admonition-title"] },
				children: [{ type: "text", value: title }],
			},
			{
				type: "element",
				tagName: "div",
				properties: { className: ["admonition-content"] },
				children,
			},
		],
	};
}

function parseGithubAlert(node) {
	if (!isElement(node, "blockquote")) {
		return null;
	}

	const firstParagraphIndex = node.children.findIndex((child) =>
		isElement(child, "p"),
	);
	if (firstParagraphIndex === -1) {
		return null;
	}

	const firstParagraph = node.children[firstParagraphIndex];
	const paragraphText = getText(firstParagraph).trim();
	const [headerLine, ...bodyLines] = paragraphText.split(/\r?\n/);

	const headerMatch = headerLine.match(/^\[!([a-zA-Z]+)\](?:\s+(.+))?$/);
	if (!headerMatch) {
		return null;
	}

	const type = headerMatch[1].toLowerCase();
	if (!ADMONITION_TYPES.has(type)) {
		return null;
	}

	const title = (headerMatch[2] ?? DEFAULT_TITLES[type]).trim();
	const contentChildren = node.children.filter(
		(_, index) => index !== firstParagraphIndex,
	);
	const bodyFromHeaderParagraph = bodyLines.join("\n").trim();

	if (bodyFromHeaderParagraph) {
		contentChildren.unshift(makeTextParagraph(bodyFromHeaderParagraph));
	}

	return makeAdmonition(type, title, contentChildren);
}

function transformChildren(parent) {
	if (!Array.isArray(parent.children)) {
		return;
	}

	for (const child of parent.children) {
		transformChildren(child);
	}

	for (let index = 0; index < parent.children.length; index += 1) {
		const admonitionNode = parseGithubAlert(parent.children[index]);
		if (admonitionNode) {
			parent.children[index] = admonitionNode;
		}
	}
}

export default function rehypeAdmonitions() {
	return (tree) => {
		transformChildren(tree);
	};
}
