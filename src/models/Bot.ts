import '@lavaclient/queue';
import { Client, Collection, GatewayDispatchEvents, GatewayIntentBits, Snowflake } from 'discord.js';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { Node } from 'lavaclient';
import { ImgurClient } from '../util/imgur/ImgurClient.js';
import { Config } from './config/Config.js';
import { SlashCommand } from './SlashCommand.js';
import { Configuration, OpenAIApi } from 'openai';
import { getCurrentPfp, setPfp } from '../util/settings/GlobalSettingsManager.js';

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

    readonly music: Node;

    readonly commands: Collection<Snowflake, [string, SlashCommand]> = new Collection();

    readonly imgur: ImgurClient;

    readonly openai: OpenAIApi;

    readonly Bot: Bot = this;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.MessageContent,
            ],
        });

        this.config = yaml.load(fs.readFileSync('./config.yml', 'utf8')) as Config;

        this.music = new Node({
            sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
            connection: {
                host: this.config.lavalink.ip,
                port: this.config.lavalink.port,
                password: this.config.lavalink.password,
            },
        });

        const openaiConfig = new Configuration({ apiKey: process.env.OPENAI_API_KEY });

        this.openai = new OpenAIApi(openaiConfig);

        this.imgur = new ImgurClient(this.config.imgur.clientId, this.config.imgur.clientSecret);

        this.ws.on(GatewayDispatchEvents.VoiceServerUpdate, (data) => this.music.handleVoiceUpdate(data));
        this.ws.on(GatewayDispatchEvents.VoiceStateUpdate, (data) => this.music.handleVoiceUpdate(data));
    }
}

declare module 'discord.js' {
    // eslint-disable-next-line no-shadow
    interface Client {
        readonly music: Node;
        readonly config: Config;
        readonly imgur: ImgurClient;
        readonly openai: OpenAIApi;
        readonly Bot: Bot;
    }
}
