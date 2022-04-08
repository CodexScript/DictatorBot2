import {
  Client, Collection, Intents, Snowflake
} from 'discord.js';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { Node } from 'lavaclient';
import redis from 'redis';
import { ImgurClient } from '../util/imgur/ImgurClient.js';
import { TrackScheduler } from '../util/music/TrackScheduler.js';
import SpotifyClient from '../util/spotify/SpotifyClient.js';
import { Config } from './config/Config.js';
import { SlashCommand } from './SlashCommand.js';

export default class Bot extends Client {
  readonly music: Node;

  readonly musicManagers = new Collection<Snowflake, TrackScheduler>();

  readonly config: Config;

  readonly commands: Collection<Snowflake, SlashCommand> = new Collection();

  readonly spotify: SpotifyClient;

  readonly redisClient: redis.RedisClientType<any, Record<string, never>>;

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

    this.redisClient = redis.createClient({
      socket: {
        host: this.config.settingsDatabase.host,
        port: this.config.settingsDatabase.port
      },
      password: this.config.settingsDatabase.password
    });

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

  async connectRedis(): Promise<void> {
    this.redisClient.on('connect', () => {
      console.log('Redis connected!');
      this.redisConnected = true;
    });

    await this.redisClient.connect();
  }
}

declare module 'discord.js' {
  // eslint-disable-next-line no-shadow
  interface Client {
    readonly music: Node;
    readonly musicManagers: Collection<Snowflake, TrackScheduler>;
    readonly config: Config;
    readonly spotify: SpotifyClient;
    readonly redisClient: redis.RedisClientType<any, Record<string, never>>;
    readonly redisConnected: boolean;
    readonly imgur: ImgurClient;
    connectRedis(): Promise<void>;
  }
}
