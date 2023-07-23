import axios from 'axios';
import { EventEmitter } from 'events';
import { TiktokFavsResponse, TiktokVideo, TiktokVideoListing } from '../models/Tiktok';
import { TiktokConfig } from '../models/config/TiktokConfig.js';

export class TiktokManager {
    config: TiktokConfig;

    lastFetch = new Date();

    videos: Array<TiktokVideo> = [];

    isFetching = false;

    constructor(config: TiktokConfig) {
        this.config = config;
    }

    async populateFavs(bus: EventEmitter) {
        if (this.isFetching) {
            return false;
        }

        this.lastFetch = new Date();
        this.isFetching = true;
        this.videos = [];

        let cursor = 0;
        let hasMore = true;
        let iterated = 0;

        while (hasMore && iterated < 500) {
            const url = `https://api19-normal-c-useast1a.tiktokv.com/aweme/v1/aweme/listcollection/?app_language=en&count=30&cursor=${cursor}&account_region=US`;

            const response = await axios.get(url, {
                headers: {
                    'user-agent': 'TikTok 16.6.5 rv:166515 (iPhone; iOS 14.0; en_US) Cronet',
                    'x-khronos': this.config.xKhronos,
                    'x-gorgon': this.config.xGorgon,
                    cookie: this.config.cookie,
                },
            });

            const favs = response.data as TiktokFavsResponse;

            for (const vid of favs.aweme_list) {
                if (
                    vid.video &&
                    (vid.can_play === undefined || vid.can_play) &&
                    vid.video.play_addr?.url_list !== undefined &&
                    this.isValidVideo(vid)
                ) {
                    this.videos.push(vid.video);
                }
            }
            hasMore = favs.has_more === 1;
            cursor = favs.cursor;
            const diff = 500 - iterated;
            if (diff < 30) {
                iterated += diff;
            } else {
                iterated += 30;
            }
        }
        this.isFetching = false;
        bus.emit('unlocked');
    }

    isValidVideo(video: TiktokVideoListing): boolean {
        let hashtagsValid = true;
        let soundValid = true;
        let authorValid = true;

        if (this.config.badHashtags !== undefined && this.config.badHashtags.length > 0) {
            hashtagsValid = !this.config.badHashtags.some(
                (r) => video.text_extra.filter((e) => e.hashtag_name === r).length > 0,
            );
        }

        if (video.music?.id && this.config.badSounds.includes(video.music.id)) {
            soundValid = false;
        }

        if (this.config.badAuthors !== undefined && this.config.badAuthors.length > 0) {
            authorValid =
                video.author?.unique_id !== undefined && !this.config.badAuthors.includes(video.author.unique_id);
        }

        return hashtagsValid && soundValid && authorValid;
    }
}
