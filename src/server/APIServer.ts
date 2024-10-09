import Bot from '../models/Bot.js';
import express from 'express';
import axios from 'axios';

export async function createServer(discordBot: Bot) {
    const app = express();
    app.use(express.json());

    app.get('/kick/:id', async (req, res) => {
        console.log('Got request with id ' + req.params.id);
        res.send('Kick Endpoint');
        await kickContinous(20000, discordBot, req.params.id);
    });

    app.post('/overseerr', async (req, res) => {
        await alertBadRequest(req.body, discordBot);
        res.sendStatus(200);
    });

    app.listen(3000, () => {
        console.log('API server listening on port 3000');
    });
}

function kickContinous(durationMillis: number, discordBot: Bot, id: string): Promise<void> {
    return new Promise((resolve) => {
        const startTime = Date.now();

        async function checkTime() {
            if (Date.now() - startTime >= durationMillis) {
                resolve();
            } else {
                try {
                    const guild = discordBot.guilds.cache.get(discordBot.config.mainGuildID);
                    if (!guild) {
                        resolve();
                    }

                    const member = await guild?.members.fetch(id);

                    if (!member) {
                        resolve();
                    }

                    if (member) {
                        if (member.voice.channel) {
                            await member.voice.setChannel(null);
                        }
                    }
                    setTimeout(checkTime, 100);
                } catch (e) {
                    console.log(e);
                    resolve();
                }
            }
        }

        checkTime();
    });
}

async function alertBadRequest(overseerrPayload: any, discordBot: Bot) {
    // If overseerr is not configured then skip
    if (!discordBot.config.overseerrEndpoint || !discordBot.config.overseerrToken) {
        return;
    }

    // Needs to be a TV show that was just requested
    if (
        (overseerrPayload['notification_type'] !== 'MEDIA_PENDING' &&
            overseerrPayload['notification_type'] !== 'MEDIA_AUTO_APPROVED') ||
        !overseerrPayload['media'] ||
        overseerrPayload['media']['media_type'] !== 'tv'
    ) {
        return;
    }

    if (!overseerrPayload['request'] || !overseerrPayload['request']['request_id']) {
        return;
    }

    const seriesId = overseerrPayload['media']['tmdbId'];

    const show = await axios.get(`${discordBot.config.overseerrEndpoint}/api/v1/tv/${seriesId}`, {
        headers: {
            'X-Api-Key': discordBot.config.overseerrToken,
        },
    });

    if (!show.data['keywords']) {
        return;
    }

    let isAnime = false;

    for (let keyword of show.data['keywords']) {
        if (keyword['name'] && keyword['name'] === 'anime') {
            isAnime = true;
            break;
        }
    }

    if (!isAnime) {
        return;
    }

    await axios.post(
        `${discordBot.config.overseerrEndpoint}/api/v1/request/${overseerrPayload['request']['request_id']}/decline`,
        {},
        {
            headers: { 'X-Api-Key': discordBot.config.overseerrToken },
        },
    );

    if (!overseerrPayload['request']['requestedBy_discord']) {
        return;
    }

    const userId = overseerrPayload['request']['requestedBy_discord'];

    const user = await discordBot.users.fetch(userId);
    await user.send(`Hello,
It seems that you've requested the anime ${show.data['name']}. This is your reminder that anime is not supposed to be requested.
Requests for anime should be directly communicated to <@${discordBot.config.ownerID}>.
Your request has been automatically declined.`);
}
