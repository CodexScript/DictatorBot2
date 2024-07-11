import { ActivityType, Client, Collection, GatewayIntentBits, Snowflake, TextBasedChannel } from 'discord.js';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { Manager, Payload } from 'magmastream';
import { ImgurClient } from '../util/imgur/ImgurClient.js';
import { Config } from './config/Config.js';
import { SlashCommand } from './SlashCommand.js';
import { OpenAI } from 'openai';
import { getCurrentPfp, setPfp } from '../util/settings/GlobalSettingsManager.js';
import { DefaultWebSocketManagerOptions } from 'discord.js';

function isDaylightSavingsReady(): boolean {
    // Get current date
    const currentDate = new Date();

    // Check if the current month is March
    if (currentDate.getMonth() !== 2) {
        return false;
    }

    // Get day of the month
    const currentDay = currentDate.getDate();

    // Find the date of the second Sunday in March
    let secondSundayInMarch = 8; // March 1st is a Wednesday at latest, so March 8th is a Sunday at least

    // if March 1 is Sunday, then March 8 is second Sunday
    // if not, add difference between 7 and day of week to get second Sunday
    if (new Date(currentDate.getFullYear(), 2, 1).getDay() !== 0) {
        secondSundayInMarch += 7 - new Date(currentDate.getFullYear(), 2, 1).getDay();
    }

    // Check if the current day of the month is the second Sunday of March, or past that
    if (currentDay < secondSundayInMarch) {
        return false;
    }

    return true;
}

function thanksgiving(year: number): Date {
    const lastOfNov = new Date(year, 10, 30).getDay();
    const turkyDay = (lastOfNov >= 4 ? 34 : 27) - lastOfNov;
    return new Date(year, 10, turkyDay);
}

export async function setStatus(client: Bot) {
    return;
    const now = new Date();
    const thanksgivingDate = thanksgiving(now.getFullYear());
    if (now.getMonth() === 10 && now.getDate() === thanksgivingDate.getDate()) {
        client.user?.setActivity('Woke Up Thankful', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=XE69NQbbV8Y',
        });
    } else if (now.getMonth() === 5 && now.getDate() === 30) {
        client.user?.setActivity('PINK TAPE', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=jbSQTQrYAB4',
        });
    } else if (now.getMonth() === 3 && now.getDate() === 15) {
        client.user?.setActivity('LUV vs. The World', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=2g-lAExcH7Y&list=PLC-tfB9OwTFEbmcQE_s7uqHc-aE-F5TSZ',
        });
    } else if (now.getMonth() === 2 && now.getDate() === 13) {
        client.user?.setActivity('LUV vs. The World 2', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=Bt-brUAx3Uo&list=PLC-tfB9OwTFE-XE_PxgJDrOGgXPgYKR-a',
        });
    } else if (now.getMonth() === 2 && now.getDate() === 6) {
        client.user?.setActivity('Eternal Atake', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=juoznBaQbJE&list=PLC-tfB9OwTFHdk7GnG1CAoxUr4rbV2rci',
        });
    } else if (now.getMonth() === 7 && now.getDate() === 25) {
        client.user?.setActivity('LUV Is Rage 2', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=zy3HAa4wIes&list=PLsHcErHZWqJkzofPzes5qL03OR7yDnVps',
        });
    } else if (now.getMonth() === 6 && now.getDate() === 31) {
        client.user?.setActivity('The Perfect LUV Tape', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=9G-7P6-FLLM&list=PLC-tfB9OwTFHdKSDMVmQf4pUa4lqZE8Xt',
        });
    } else if (now.getMonth() === 9 && now.getDate() === 30) {
        client.user?.setActivity('LUV Is Rage', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=DKDfz4AEIPg&list=PLkKsSM2rrWtSY8nHB4Tozzj6whvNV1RWc',
        });
    } else {
        client.user?.setActivity('LUV Is Rage', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=DKDfz4AEIPg&list=PLkKsSM2rrWtSY8nHB4Tozzj6whvNV1RWc',
        });
    }
}

export async function setProfilePicture(client: Bot, force: boolean = false): Promise<void> {
    if (client.config.pfp.forced && !force) {
        return;
    }
    const pfp = await getCurrentPfp(client.config);

    let newPfp;
    const now = new Date();
    if (now.getMonth() === 3 && now.getDate() === 15) {
        newPfp = './assets/pfp/uzi-vstheworld.png';
    } else if (now.getMonth() === 2 && now.getDate() === 13) {
        newPfp = './assets/pfp/uzi-vstheworld2.jpg';
    } else if (now.getMonth() === 2 && now.getDate() === 6) {
        newPfp = './assets/pfp/uzi-eternalatake.jpg';
    } else if (now.getMonth() === 7 && now.getDate() === 25) {
        newPfp = './assets/pfp/uzi-luvisrage2.jpg';
    } else if (now.getMonth() === 6 && now.getDate() === 31) {
        newPfp = './assets/pfp/uzi-luvtape.png';
    } else if (now.getMonth() === 9 && now.getDate() === 30) {
        newPfp = './assets/pfp/uzi-luvisrage.jpg';
    } else if (now.getMonth() === 11) {
        // December
        newPfp = './assets/pfp/uzi-christmas.jpg';
    } else if (now.getMonth() === 6 || (now.getMonth() === 10 && now.getFullYear() % 4 === 0)) {
        // November of election year or July
        newPfp = './assets/pfp/uzi-president.jpg';
    } else if (now.getMonth() === 9) {
        // October
        newPfp = './assets/pfp/uzi-halloween.png';
    } else if (now.getMonth() === 3 && now.getDate() === 1) {
        // April Fools
        newPfp = './assets/pfp/carti.png';
    } else if (now.getMonth() === 3 && now.getDate() === 20) {
        // 420
        newPfp = './assets/pfp/uzi-smacked.jpg';
    } else if (isDaylightSavingsReady()) {
        // Daylight savings begins
        // TODO: Currently broken
        newPfp = './assets/pfp/uzi-tart.png';
    } else {
        newPfp = './assets/pfp/uzi-donda.jpg';
    }

    if (pfp !== newPfp) {
        console.log('Changing PFP...');
        await client.user?.setAvatar(newPfp);
        await setPfp(client, newPfp);
    }
}

export default class Bot extends Client {
    config: Config;

    readonly music: Manager;

    readonly commands: Collection<Snowflake, [string, SlashCommand]> = new Collection();

    readonly imgur: ImgurClient;

    readonly openai: OpenAI | null;

    readonly Bot: Bot = this;

    constructor() {
        (DefaultWebSocketManagerOptions.identifyProperties as any).browser = 'Discord iOS';
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.config = yaml.load(fs.readFileSync('./config.yml', 'utf8')) as Config;

        const nodes = [
            {
                host: this.config.lavalink.ip,
                identifier: 'Node 1',
                port: this.config.lavalink.port,
                secure: false,
                password: this.config.lavalink.password,
                retryAmount: 1000,
                retryDelay: 10000,
                resumeStatus: false,
                resumeTimeout: 1000,
            },
        ];

        this.music = new Manager({
            nodes,

            send: (id: string, payload: Payload) => {
                const guild = this.Bot.guilds.cache.get(id);
                if (guild) {
                    console.log('Sending shard');
                    guild.shard.send(payload);
                } else {
                    console.warn('No guild found for send');
                }
            },
        });

        this.on('raw', (data) => {
            this.music.updateVoiceState(data);
        });

        this.music.on('queueEnd', async (eventPlayer) => {
            console.warn('Queue is over');
            eventPlayer.destroy();
        });

        this.music.on('trackStart', async (eventPlayer, track, payload) => {
            console.log('Track starting...');
        });

        this.music.on('trackError', async (eventPlayer, track, payload) => {
            console.warn('TRACK ERROR!: ' + JSON.stringify(payload));
            if (!eventPlayer.textChannel) return;

            const trackChannel = await this.channels.fetch(eventPlayer.textChannel);
            if (!trackChannel) return;

            if (!trackChannel.isTextBased) return;

            await (trackChannel as TextBasedChannel).send({content: "Error playing the track! The cause of this is unknown, but can usually be fixed by finding a different video."});
        });

        this.music.on('trackStuck', async (eventPlayer, track, payload) => {
            console.warn('TRACK STUCK!: ' + JSON.stringify(payload));
        });

        if (process.env.OPENAI_API_KEY == undefined) {
            this.openai = null;
        } else {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }

        this.imgur = new ImgurClient(this.config.imgur.clientId, this.config.imgur.clientSecret);
    }
}

declare module 'discord.js' {
    // eslint-disable-next-line no-shadow
    interface Client {
        readonly music: Manager;
        readonly config: Config;
        readonly imgur: ImgurClient;
        readonly openai: OpenAI | null;
        readonly Bot: Bot;
        readonly commands: Collection<Snowflake, [string, SlashCommand]>
    }
}
