import '@lavaclient/queue';
import {
  Client, Collection, Intents, Snowflake
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

export default class Bot extends Client {

  config: Config;

  readonly music: Node;

  readonly commands: Collection<Snowflake, [string, SlashCommand]> = new Collection();

  readonly spotify: SpotifyClient;

  readonly sql: BetterSqlite3.Database;

  readonly imgur: ImgurClient;

  redisConnected: boolean = false;

  constructor() {
    super({
      ws: {
        properties: {
          $browser: 'Discord iOS'
        }
      },
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS],
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

    this.ws.on('VOICE_SERVER_UPDATE', (data) => this.music.handleVoiceUpdate(data));
    this.ws.on('VOICE_STATE_UPDATE', (data) => this.music.handleVoiceUpdate(data));
  }

}

declare module 'discord.js' {
  // eslint-disable-next-line no-shadow
  interface Client {
    readonly music: Node;
    config: Config;    
    readonly spotify: SpotifyClient;
    readonly sql: BetterSqlite3.Database;
    readonly imgur: ImgurClient;
  }
}
