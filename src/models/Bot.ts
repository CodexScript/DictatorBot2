import { Client, Collection, Intents, Snowflake } from 'discord.js';
import * as fs from 'fs';
import yaml from 'js-yaml';
import { Node } from 'lavaclient';
import { TrackScheduler } from '../util/music/TrackScheduler.js';
import SpotifyClient from '../util/spotify/SpotifyClient.js';
import { Config } from './config/Config.js';
import { SlashCommand } from './SlashCommand.js';

export class Bot extends Client {
	readonly music: Node;
	readonly musicManagers = new Collection<Snowflake, TrackScheduler>();
	readonly config: Config;
	readonly commands: Collection<Snowflake, SlashCommand> = new Collection();
	readonly spotify: SpotifyClient;

	constructor() {
		super({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
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

		this.spotify = new SpotifyClient(this.config.spotify.token, this.config.spotify.secret);

		this.ws.on('VOICE_SERVER_UPDATE', data => this.music.handleVoiceUpdate(data));
		this.ws.on('VOICE_STATE_UPDATE', data => this.music.handleVoiceUpdate(data));
	}
}

declare module 'discord.js' {
	// eslint-disable-next-line no-shadow
	interface Client {
		readonly music: Node;
		readonly musicManagers: Collection<Snowflake, TrackScheduler>;
		readonly config: Config;
		readonly spotify: SpotifyClient;
	}
}