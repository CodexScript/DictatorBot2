import '@lavaclient/queue';
import {
  Client, Collection, GatewayDispatchEvents, GatewayIntentBits, Snowflake
} from 'discord.js';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { Node } from 'lavaclient';
import { ImgurClient } from '../util/imgur/ImgurClient.js';
import SpotifyClient from '../util/spotify/SpotifyClient.js';
import { Config } from './config/Config.js';
import { SlashCommand } from './SlashCommand.js';
import Database from 'better-sqlite3';
import * as BetterSqlite3 from 'better-sqlite3';
import path from 'path';
import { getCurrentPfp, setPfp } from '../util/settings/GlobalSettingsManager.js';

export async function setProfilePicture(client: Bot): Promise<void> {

  if (client.config.pfp.forced) {
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
  } else if (now.getMonth() === 2 && now.getDate() > 13) {
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

  readonly spotify: SpotifyClient;

  readonly sql: BetterSqlite3.Database;

  readonly imgur: ImgurClient;

  readonly Bot: Bot = this;

  redisConnected: boolean = false;

  constructor() {
    super({
      ws: {
        properties: {
          browser: 'Discord iOS'
        }
      },
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageReactions],
    });

    this.config = yaml.load(fs.readFileSync('./config.yml', 'utf8')) as Config;
    

    console.log(path.resolve('./assets/memes.sqlite'));
    this.sql = new Database('./assets/memes.sqlite');
    this.sql.exec('CREATE TABLE IF NOT EXISTS memes (name TEXT PRIMARY KEY, url TEXT NOT NULL)');
    this.sql.exec('CREATE UNIQUE INDEX IF NOT EXISTS memes_name ON memes (name)');

    this.music = new Node({
      sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: this.config.lavalink.ip,
        port: this.config.lavalink.port,
        password: this.config.lavalink.password,
      },
    });

    this.spotify = new SpotifyClient(this.config.spotify.token, this.config.spotify.secret);

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
    readonly spotify: SpotifyClient;
    readonly sql: BetterSqlite3.Database;
    readonly imgur: ImgurClient;
    readonly Bot: Bot;
  }
}
