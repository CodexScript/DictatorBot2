export type BasedometerCategory = {
	directoryName: string;
	displayName: string;
	tolerance: number;
	entries: Array<BasedometerEntry>;
}

export type BasedometerEntry = {
	name: string;
	files: Array<string>;
	baseRating: number;
}