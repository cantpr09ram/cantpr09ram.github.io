import { useEffect, useRef, type CSSProperties } from "react";
import createGlobe from "cobe";

export type GlobeMarker = {
	location: [number, number];
	size?: number;
	color?: [number, number, number];
	id?: string;
	label?: string;
};

type Props = {
	canvasId?: string;
	sizeClass?: string;
	rotationSpeed?: number;
	mapBrightness?: number;
	dark?: number;
	initialLocation?: [number, number];
	markers?: GlobeMarker[];
};

const markerLabelStyle: CSSProperties = {
	position: "absolute",
	left: 0,
	top: 0,
	transform: "translate(-50%, calc(-100% - 6px))",
	color: "var(--app-text)",
	fontSize: "0.6875rem",
	whiteSpace: "nowrap",
	opacity: 0,
	pointerEvents: "none",
	textShadow:
		"0 1px 2px color-mix(in srgb, var(--app-bg) 70%, transparent), 0 0 4px color-mix(in srgb, var(--app-bg) 70%, transparent)",
	transition: "opacity 120ms ease",
};

const DEFAULT_INITIAL_LOCATION: [number, number] = [23.6978, 120.9605];

function locationToAngles(location: [number, number]): { phi: number; theta: number } {
	const [lat, lon] = location;
	if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
		return { phi: 0, theta: 0.28 };
	}

	const r = (lat * Math.PI) / 180;
	const a = (lon * Math.PI) / 180 - Math.PI;
	const tx = -Math.cos(r) * Math.cos(a);
	const ty = Math.sin(r);
	const tz = Math.cos(r) * Math.sin(a);
	const horizontal = Math.sqrt(tx * tx + tz * tz);

	return {
		phi: Math.atan2(-tx, tz),
		theta: Math.atan2(ty, horizontal),
	};
}

export default function EarthGlobe({
	canvasId = "earth-globe",
	sizeClass = "aspect-square w-[78vw] max-w-[420px] sm:w-[72vw]",
	rotationSpeed = 0.01,
	mapBrightness = 6,
	dark,
	initialLocation = DEFAULT_INITIAL_LOCATION,
	markers = [],
}: Props) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const labelLayerRef = useRef<HTMLDivElement | null>(null);
	const fallbackRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		const canvas = canvasRef.current;
		const labelLayer = labelLayerRef.current;
		const fallback = fallbackRef.current;
		const root = document.documentElement;

		if (!wrapper || !canvas) {
			return;
		}

		const globeMarkers = markers
			.filter(
				(marker) =>
					Array.isArray(marker?.location) &&
					marker.location.length === 2 &&
					typeof marker.location[0] === "number" &&
					typeof marker.location[1] === "number",
			)
			.map(({ location, size, color, id }) => ({ location, size, color, id }));

		const showFallback = () => {
			if (fallback) {
				fallback.classList.remove("hidden");
				fallback.classList.add("flex");
			}
		};

		const hasWebGL = !!(
			canvas.getContext("webgl", { alpha: true, antialias: true }) ||
			canvas.getContext("experimental-webgl")
		);
		if (!hasWebGL) {
			showFallback();
			return;
		}

		const getPalette = () =>
			root.classList.contains("dark")
				? {
						baseColor: [0.08, 0.08, 0.08] as [number, number, number],
						markerColor: [0.94, 0.94, 0.94] as [number, number, number],
						glowColor: [0.2, 0.2, 0.2] as [number, number, number],
						dark: 0.95,
					}
				: {
						baseColor: [0.94, 0.94, 0.94] as [number, number, number],
						markerColor: [0.08, 0.08, 0.08] as [number, number, number],
						glowColor: [0.85, 0.85, 0.85] as [number, number, number],
						dark: 0.05,
					};

		const getAnchor = (id: string) =>
			wrapper.querySelector(
				`[style*="anchor-name:--cobe-${id}"], [style*="anchor-name: --cobe-${id}"]`,
			);

		const { phi: initialPhi, theta: initialTheta } = locationToAngles(initialLocation);
		let phi = initialPhi;
		let theta = initialTheta;
		let globe: ReturnType<typeof createGlobe> | undefined;
		let resizeFrame = 0;
		let spinFrame = 0;
		let labelFrame = 0;
		let isDragging = false;
		let lastX = 0;
		let lastY = 0;
		let currentThemeIsDark = root.classList.contains("dark");

		const clampTheta = (value: number) =>
			Math.max(-Math.PI / 2 + 0.08, Math.min(Math.PI / 2 - 0.08, value));

		const syncLabels = () => {
			if (!labelLayer) {
				return;
			}
			for (const label of labelLayer.querySelectorAll("[data-marker-label]")) {
				if (!(label instanceof HTMLElement)) {
					continue;
				}
				const id = label.dataset.markerLabel;
				if (!id) {
					continue;
				}

				const anchor = getAnchor(id);
				if (!(anchor instanceof HTMLElement)) {
					label.style.opacity = "0";
					continue;
				}

				label.style.left = anchor.style.left;
				label.style.top = anchor.style.top;

				const visibleVar = getComputedStyle(document.documentElement)
					.getPropertyValue(`--cobe-visible-${id}`)
					.trim();
				label.style.opacity = visibleVar ? "1" : "0";
			}
		};

		const startLabelSync = () => {
			cancelAnimationFrame(labelFrame);
			const tick = () => {
				syncLabels();
				labelFrame = requestAnimationFrame(tick);
			};
			labelFrame = requestAnimationFrame(tick);
		};

		const startSpin = () => {
			cancelAnimationFrame(spinFrame);
			const animate = () => {
				if (!isDragging) {
					phi += rotationSpeed;
				}
				globe?.update({ phi, theta });
				spinFrame = requestAnimationFrame(animate);
			};
			spinFrame = requestAnimationFrame(animate);
		};

		const mountGlobe = () => {
			const size = Math.round(
				Math.min(wrapper.clientWidth || 360, window.innerWidth * 0.8),
			);
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const palette = getPalette();
			const darkLevel = Number.isFinite(dark) ? dark : palette.dark;
			const brightness = Number.isFinite(mapBrightness) ? mapBrightness : 6;

			try {
				globe?.destroy();
				globe = createGlobe(canvas, {
					devicePixelRatio: dpr,
					width: size * dpr,
					height: size * dpr,
					phi,
					theta,
					dark: darkLevel,
					diffuse: 1.5,
					mapSamples: 22000,
					mapBrightness: brightness,
					mapBaseBrightness: 0,
					baseColor: palette.baseColor,
					markerColor: palette.markerColor,
					glowColor: palette.glowColor,
					markerElevation: 0.06,
					markers: globeMarkers,
				});
				startSpin();
				startLabelSync();
			} catch (error) {
				console.warn("EarthGlobe failed to render.", error);
				showFallback();
			}
		};

		const onPointerDown = (event: PointerEvent) => {
			isDragging = true;
			lastX = event.clientX;
			lastY = event.clientY;
			canvas.setPointerCapture?.(event.pointerId);
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!isDragging) {
				return;
			}
			const deltaX = event.clientX - lastX;
			const deltaY = event.clientY - lastY;
			lastX = event.clientX;
			lastY = event.clientY;
			phi += deltaX * 0.01;
			theta = clampTheta(theta - deltaY * 0.01);
			globe?.update({ phi, theta });
		};

		const onPointerUp = (event: PointerEvent) => {
			isDragging = false;
			canvas.releasePointerCapture?.(event.pointerId);
		};

		const onResize = () => {
			cancelAnimationFrame(resizeFrame);
			resizeFrame = requestAnimationFrame(mountGlobe);
		};

		const themeObserver = new MutationObserver(() => {
			const nextThemeIsDark = root.classList.contains("dark");
			if (nextThemeIsDark !== currentThemeIsDark) {
				currentThemeIsDark = nextThemeIsDark;
				mountGlobe();
			}
		});

		mountGlobe();
		canvas.addEventListener("pointerdown", onPointerDown);
		canvas.addEventListener("pointermove", onPointerMove);
		canvas.addEventListener("pointerup", onPointerUp);
		canvas.addEventListener("pointercancel", onPointerUp);
		canvas.addEventListener("pointerleave", onPointerUp);
		window.addEventListener("resize", onResize);
		themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

		return () => {
			cancelAnimationFrame(resizeFrame);
			cancelAnimationFrame(spinFrame);
			cancelAnimationFrame(labelFrame);
			canvas.removeEventListener("pointerdown", onPointerDown);
			canvas.removeEventListener("pointermove", onPointerMove);
			canvas.removeEventListener("pointerup", onPointerUp);
			canvas.removeEventListener("pointercancel", onPointerUp);
			canvas.removeEventListener("pointerleave", onPointerUp);
			window.removeEventListener("resize", onResize);
			themeObserver.disconnect();
			globe?.destroy();
		};
	}, [rotationSpeed, mapBrightness, dark, initialLocation, markers]);

	return (
		<div ref={wrapperRef} className={`relative ${sizeClass}`}>
			<canvas
				id={canvasId}
				ref={canvasRef}
				className="block h-full w-full touch-none cursor-grab active:cursor-grabbing"
				aria-hidden="true"
			/>
			<div
				ref={labelLayerRef}
				className="pointer-events-none absolute inset-0 text-xs font-medium"
				data-earth-label-layer
			>
				{markers
					.filter((marker) => marker.id && marker.label)
					.map((marker) => (
						<div
							key={marker.id}
							className="marker-label"
							data-marker-label={marker.id}
							style={markerLabelStyle}
						>
							{marker.label}
						</div>
					))}
			</div>
			<div
				ref={fallbackRef}
				className="absolute inset-0 hidden items-center justify-center rounded-full border border-sky-200/70 bg-sky-100/50 text-xs font-medium tracking-wide text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-100"
				data-earth-fallback
			>
				MAP UNAVAILABLE
			</div>
		</div>
	);
}
