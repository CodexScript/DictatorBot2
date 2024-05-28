import { Events, Message } from 'discord.js';
import axios from 'axios';

function extractMusicURL(msg: string) {
    try {
        const url = new URL(msg);
        if (url.hostname === 'music.apple.com' || url.hostname === 'open.spotify.com') {
            return url.href;
        }
    } catch (e) {
        return null;
    }

    return null;
}

function classifyURL(url: string) {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes('spotify.com')) {
        const pathSegments = urlObj.pathname.split('/');

        if (pathSegments[1] === 'album') {
            return ['spotify', 'album'];
        } else if (pathSegments[1] === 'track') {
            return ['spotify', 'song'];
        }
    } else if (urlObj.hostname.includes('apple.com')) {
        const pathSegments = urlObj.pathname.split('/');

        if (pathSegments[2] === 'album') {
            const searchParams = urlObj.searchParams;

            if (searchParams.has('i')) {
                return ['applemusic', 'song'];
            } else {
                return ['applemusic', 'album'];
            }
        }
    }

    return [null, null];
}

export const name = Events.MessageCreate;
export const once = false;
export const execute = async (msg: Message) => {
    if (msg.author.bot || msg.author.id == msg.client.user.id) return;

    if (!msg.client.config.APImusicURL || msg.client.config.APImusicURL === '') return;

    const url = extractMusicURL(msg.content);
    if (!url) {
        console.log('URL does not match');
        return;
    }

    const [service, type] = classifyURL(url);

    if (!service || !type) return;

    try {
        const response = await axios.post(
            new URL('http://' + msg.client.config.APImusicURL + '/convertURL').toString(),
            {
                url: url,
                source: service,
                type: type,
            },
        );

        if (response.status !== 200) return;

        if (!response.data || !response.data.hasOwnProperty('success') || response.data.success !== true) return;

        const oppositeService = service === 'spotify' ? 'Apple Music' : 'Spotify';

        await msg.reply({
            content: `${response.data.originTitle} by ${response.data.originArtist} on ${oppositeService}: ${response.data.url}`,
        });
    } catch (e: any) {
        console.warn(`Error while trying to convert music streaming URL: ${e.message}`);
        return;
    }
};