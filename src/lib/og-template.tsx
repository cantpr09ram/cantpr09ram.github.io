interface OgTemplateProps {
	title: string;
	description: string;
	siteName: string;
}

const fontFamily = "EB Garamond, Noto Serif TC";

export function OgTemplate({ title, description, siteName }: OgTemplateProps) {
	const truncTitle = title.length > 60 ? `${title.slice(0, 57)}…` : title;
	const truncDesc =
		description.length > 120 ? `${description.slice(0, 117)}…` : description;

	return (
		<div style={{ display: "flex", flexDirection: "column", width: 1200, height: 630, backgroundColor: "#18181b" }}>
			{/* Accent line */}
			<div style={{ width: "100%", height: 3, backgroundColor: "#374151" }} />

			{/* Main content */}
			<div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: 80, paddingRight: 80, paddingTop: 64, paddingBottom: 48 }}>
				{/* Site name */}
				<div style={{ fontFamily, fontWeight: 400, fontSize: 20, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 32 }}>
					{siteName}
				</div>

				{/* Title */}
				<div style={{ fontFamily, fontWeight: 700, fontSize: 64, color: "#f3f4f6", lineHeight: 1.15, flex: 1 }}>
					{truncTitle}
				</div>

				{/* Description */}
				{truncDesc && (
					<div style={{ fontFamily, fontWeight: 400, fontSize: 28, color: "#9ca3af", lineHeight: 1.4, marginTop: 24 }}>
						{truncDesc}
					</div>
				)}
			</div>

			{/* Bottom bar */}
			<div style={{ display: "flex", flexDirection: "row", alignItems: "center", paddingLeft: 80, paddingRight: 80, paddingBottom: 40 }}>
				<div style={{ fontFamily, fontSize: 18, color: "#4b5563", letterSpacing: "0.05em" }}>
					cantpr09ram.cc
				</div>
			</div>
		</div>
	);
}
