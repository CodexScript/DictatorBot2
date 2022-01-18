export type TiktokFavsResponse = {
	has_more: number;
	cursor: number;
	aweme_list: Array<TiktokVideoListing>;
	status_code: number;
}

export type TiktokVideoListing = {
	author_user_id?: string;
	prevent_download?: boolean;
	statistics?: TiktokVideoStatistics;
	aweme_id?: string;
	share_info?: TiktokShareInfo;
	music?: TiktokMusic;
	content_desc?: string;
	desc?: string;
	video?: TiktokVideo;
	can_play: boolean;
	author?: TiktokAuthor;
	create_time?: number;
	text_extra: Array<TiktokHashtag>;
}

export type TiktokAuthor = {
	uid?: string;
	nickname?: string;
	unique_id?: string;
}

export type TiktokVideo = {
	height?: number;
	width?: number;
	download_addr?: TiktokDownloadAddr;
	play_addr?: TiktokPlayAddr;
}

export type TiktokPlayAddr = {
	height: number;
	uri: string;
	url_key: string;
	url_list: Array<string>;
	width: number;
	data_size: number;
}

export type TiktokDownloadAddr = {
	height: number;
	uri: string;
	url_list: Array<string>;
	width: number;
	data_size: number;
}

export type TiktokVideoStatistics = {
	lose_count?: number;
	play_count: number;
	aweme_id: string;
	comment_count: number;
	digg_count: number;
	download_count: number;
	forward_count: number;
	loseComment_count?: number;
	share_count?: number;
}

export type TiktokMusic = {
	play_url: GenericTiktokMedia;
	author: string;
	author_deleted: boolean;
	is_original_sound: boolean;
	sec_uid?: string;
	status: number;
	id: string;
	mid: string;
	is_commerce_music: boolean;
	is_matched_metadata: boolean;
	duration: number;
	title: string;
	album: string;
	mute_share: boolean;
	owner_nickname: string;
	prevent_download: boolean;
	user_count: number;
	video_duration: number;
	owner_handle: string;
	is_author_artist: boolean;
	is_original: boolean;
	shoot_duration: number;
	audition_duration: number;
}

export type GenericTiktokMedia = {
	width?: number;
	height?: number;
	uri: string;
	url_list: Array<string>;
}

export type TiktokShareInfo = {
	shareUrl: string;
	shareDesc?: string;
	shareLinkDesc?: string;
	shareQuote?: string;
	shareSignatureDesc?: string;
	shareSignatureUrl?: string;
	shareTitle?: string;
	boolPersist?: number;
	shareTitleMyself?: string;
	shareTitleOther?: string;
	shareWeiboDesc?: string;
	shareDescInfo?: string;
}

export type TiktokHashtag = {
	end?: number;
	hashtag_id?: string;
	hashtag_name?: string;
	start: number;
	type: number;
	is_commerce?: boolean;
}