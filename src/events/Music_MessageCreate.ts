import { ButtonStyle, Events, Message } from 'discord.js';
import axios from 'axios';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';

function extractSpotifyURL(text: string) {
    const spotifyPattern = /https:\/\/open\.spotify\.com\/(album|track)\/[a-zA-Z0-9]{22}(?:\?si=[a-zA-Z0-9]{22})?/g;
    const match = text.match(spotifyPattern);
    return match ? match[0] : null;
}

function extractAppleMusicURL(text: string) {
    const appleMusicPattern = /https:\/\/music\.apple\.com\/[a-z]{2}\/album\/[^\/]+\/\d+\??(?:i=\d+)?/g;
    const match = text.match(appleMusicPattern);
    return match ? match[0] : null;
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

    let url = extractSpotifyURL(msg.content);
    if (!url) {
        url = extractAppleMusicURL(msg.content);
        if (!url) {
            console.log('No match');
            return;
        }
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

        const trash = new ButtonBuilder().setCustomId('delete-music').setLabel('🗑️').setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(trash);

        const msgResponse = await msg.reply({
            content: `${response.data.originTitle} by ${response.data.originArtist} on ${oppositeService}: ${response.data.url}`,
            components: [row],
        });

        const collectorFilter = (i: any) => {
            if (i.user.id === msg.author.id) {
                return true;
            } else {
                i.reply({
                    content: `Only <@${msg.author.id}> can delete this message`,
                    ephemeral: true,
                });
                return false;
            }
        };

        try {
            const confirmation = await msgResponse.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

            if (confirmation.customId === 'delete-music') {
                await msgResponse.delete();
            }
        } catch (e: any) {
            await msgResponse.edit({
                content: `${response.data.originTitle} by ${response.data.originArtist} on ${oppositeService}: ${response.data.url}`,
                components: [],
            });
        }
    } catch (e: any) {
        console.warn(`Error while trying to convert music streaming URL: ${e.message}`);
        return;
    }
};
