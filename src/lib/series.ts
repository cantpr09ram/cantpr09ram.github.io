import type { CollectionEntry } from "astro:content";

type BlogPost = CollectionEntry<"blog">;
type SeriesData = NonNullable<BlogPost["data"]["series"]>;
export type SeriesPost = BlogPost & {
	data: BlogPost["data"] & { series: SeriesData };
};

export interface BlogSeries {
	title: string;
	slug: string;
	posts: SeriesPost[];
	latestPubDate: Date;
}

export interface SeriesContext {
	series: BlogSeries;
	currentIndex: number;
	previous?: SeriesPost;
	next?: SeriesPost;
}

export function getPublishedPosts(posts: BlogPost[]): BlogPost[] {
	return posts.filter((post) => post.data.isdrift !== true);
}

export function getAllSeries(posts: BlogPost[]): BlogSeries[] {
	const seriesBySlug = new Map<string, BlogSeries>();

	for (const post of getPublishedPosts(posts)) {
		if (!post.data.series) continue;

		const { title, slug } = post.data.series;
		const series = seriesBySlug.get(slug) ?? {
			title,
			slug,
			posts: [],
			latestPubDate: post.data.pubDate,
		};

		series.posts.push(post as SeriesPost);
		if (post.data.pubDate > series.latestPubDate) {
			series.latestPubDate = post.data.pubDate;
		}

		seriesBySlug.set(slug, series);
	}

	return [...seriesBySlug.values()]
		.map((series) => ({
			...series,
			posts: sortSeriesPosts(series.posts),
		}))
		.sort((a, b) => {
			const byDate = b.latestPubDate.valueOf() - a.latestPubDate.valueOf();
			return byDate || a.title.localeCompare(b.title);
		});
}

export function getSeriesContext(
	posts: BlogPost[],
	currentPostId: string,
): SeriesContext | undefined {
	const currentPost = posts.find((post) => post.id === currentPostId);
	if (!currentPost?.data.series) return undefined;

	const series = getAllSeries(posts).find(
		(item) => item.slug === currentPost.data.series?.slug,
	);
	if (!series) return undefined;

	const currentIndex = series.posts.findIndex(
		(post) => post.id === currentPostId,
	);
	if (currentIndex < 0) return undefined;

	return {
		series,
		currentIndex,
		previous: series.posts[currentIndex - 1],
		next: series.posts[currentIndex + 1],
	};
}

function sortSeriesPosts(posts: SeriesPost[]): SeriesPost[] {
	return [...posts].sort((a, b) => {
		const byOrder = a.data.series.order - b.data.series.order;
		return byOrder || b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
	});
}
