
// 归档
export interface ArchivePost {
	id: number;
	title: string;
	subtitle?: string;
	publishedAt: string;
	day: number;
	summary?: string;
	coverImage?: string;
}

export interface ArchiveMonth {
	month: number;
	monthName: string;
	count: number;
	posts: ArchivePost[];
	expanded?: boolean;
}

export interface ArchiveYear {
	year: number;
	count: number;
	months: ArchiveMonth[];
	expanded?: boolean;
}

export interface ArchiveStats {
	earliestYear: number;
	latestYear: number;
	yearsWithPosts: number[];
}

export interface ArchiveResponse {
	years: ArchiveYear[];
	totalPosts: number;
	totalYears: number;
	stats: ArchiveStats;
}
