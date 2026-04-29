interface OgTemplateProps {
	title: string;
	description: string;
}

const fontFamily = "EB Garamond, Noto Serif TC";

export function OgTemplate({ title, description }: OgTemplateProps) {
	const truncTitle = title.length > 60 ? `${title.slice(0, 57)}…` : title;
	const truncDesc =
		description.length > 90 ? `${description.slice(0, 87)}…` : description;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "center",
				width: 1200,
				height: 630,
				paddingLeft: 96,
				paddingRight: 96,
				backgroundColor: "#18181b",
				textAlign: "left",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-start",
				}}
			>
				<div
					style={{
						fontFamily,
						fontWeight: 700,
						fontSize: 72,
						color: "#f3f4f6",
						lineHeight: 1.12,
					}}
				>
					{truncTitle}
				</div>
				{truncDesc && (
					<div
						style={{
							fontFamily,
							fontWeight: 400,
							fontSize: 28,
							color: "#a1a1aa",
							lineHeight: 1.3,
							marginTop: 10,
						}}
					>
						{truncDesc}
					</div>
				)}
			</div>
		</div>
	);
}
