import Bot from '../models/Bot.js';
import express from 'express';

export async function createServer(discordBot: Bot) {
    const app = express();

    app.get('/kick/:id', async (req, res) => {
        console.log('Got request with id ' + req.params.id);
        res.send('Kick Endpoint');
        await kickContinous(20000, discordBot, req.params.id);
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
