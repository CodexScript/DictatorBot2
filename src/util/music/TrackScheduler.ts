/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Track } from '@lavaclient/types';
import { TextChannel } from 'discord.js';
import { Player } from 'lavaclient';

export class TrackScheduler {
	private player: Player;
	private channel: TextChannel;
	private queue: Track[];
	private loop = false;
	private currentTrack: Track | undefined;
	private shouldAnnounce = false;

	constructor(player: Player, channel: TextChannel) {
		this.player = player;
		this.channel = channel;
		this.queue = [];
		this.loop = false;

		this.player.on('trackEnd', async () => {
			if (this.loop) {
				await this.player.play(this.currentTrack!);
				return;
			}
			if (this.queue.length > 0) {
				await this.playTrack(this.queue.shift()!);
			}
			else {
				await this.player.destroy();
				this.channel.client.musicManagers.delete(this.channel.guildId);
			}
		});
	}

	get length(): number {
		return this.queue.length;
	}

	async setVolume(volume: number) {
		if (volume >= 0 && volume <= 1) {
			if (this.player.playing) {
				await this.player.setVolume(volume);
			}
		}
	}

	async queueTrack(track: Track): Promise<boolean> {
		if (this.queue.length === 0) {
			this.currentTrack = track;
			await this.playTrack(track);
			return true;
		}
		else {
			this.queue.push(track);
			return false;
		}
	}

	async pause() {
		await this.player.pause();
	}

	async resume() {
		await this.player.resume();
	}

	private async playTrack(track: Track) {
		this.currentTrack = track;
		await this.player.play(track);
		if (this.shouldAnnounce) {
			await this.channel.send(`Now playing: **${track.info.title}**`);
		}
		else {
			this.shouldAnnounce = true;
		}
	}
}