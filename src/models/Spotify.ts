export type SpotifyAccessToken = {
	access_token: string;
	token_type: string;
	expires_in: number;
	created_at: Date;
}

export type SpotifyError = {
	error: {
		status: number;
		message: string;
	}
}

export type SpotifyTrack = {
	album: {
		album_type: string;
		total_tracks: number;
		available_markets: Array<string>;
		external_urls: {
			spotify: string;
		}
		href: string;
		id: string;
		images: Array<{
			height: number;
			width: number;
			url: string;
		}>;
		name: string;
		release_date: string;
		release_date_precision: string;
		type: string;
		uri: string;
		restrictions: {
			reason: string;
		}
		album_group: string;
		artists: Array<SpotifyArtist>;
	};
	artists: Array<SpotifyArtist>;
	available_markets: Array<string>;
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: {
		isrc: string;
		ean: string;
		upc: string;
	};
	external_urls: {
		spotify: string;
	};
	href: string;
	id: string;
	name: string;
	popularity: number;
	preview_url: string;
	track_number: number;
	type: string;
	uri: string;
	is_local: boolean;
}

export type SpotifyArtist = {
	external_urls: {
		spotify: string;
	};
	followers: {
		total: number;
	};
	genres: Array<string>;
	href: string;
	id: string;
	images: Array<{
		height: number;
		width: number;
		url: string;
	}>;
	name: string;
	popularity: number;
	type: string;
	uri: string;
}

export type SpotifyAlbum = {
	album_type: string;
	total_tracks: number;
	available_markets: Array<string>;
	artists: Array<SpotifyArtist>;
	external_urls: {
		spotify: string;
	};
	href: string;
	id: string;
	images: Array<{
		height: number;
		width: number;
		url: string;
	}>;
	tracks: {
		href: string;
		items: Array<SpotifyTrack>;
		limit: number;
		next: string | null;
		offset: number;
		previous: string | null;
		total: number;
	};
	name: string;
	release_date: string;
	release_date_precision: string;
	type: string;
	uri: string;
	restrictions: {
		reason: string;
	};
}

export type SpotifySearchResult = {
	tracks: {
		href: string;
		items: SpotifyTrack[];
		limit: number;
		next: string | null;
		offset: number;
		previous: string | null;
		total: number;
	};
	artists: {
		href: string;
		items: SpotifyArtist[];
		limit: number;
		next: string | null;
		offset: number;
		previous: string | null;
		total: number;
	};
	albums: {
		href: string;
		items: SpotifyAlbum[];
		limit: number;
		next: string | null;
		offset: number;
		previous: string | null;
		total: number;
	}
}