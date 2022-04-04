/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Track } from '@lavaclient/types';
import { TextChannel } from 'discord.js';
import { Player } from 'lavaclient';

export class TrackScheduler {
  readonly player: Player;

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
      } else {
        console.log(`Destroying TrackScheduler for guild ${this.channel.guildId}, goodbye cruel world`);
        this.channel.client.musicManagers.delete(this.channel.guildId);
        this.player.disconnect();
        await this.player.destroy();
      }
    });
  }

  get length(): number {
    return this.queue.length;
  }

  getTrack(): Track | undefined {
    return this.currentTrack;
  }

  getQueue() {
    return this.queue;
  }

  async setVolume(volume: number) {
    if (volume >= 0 && volume <= 1) {
      if (this.player.playing) {
        await this.player.setVolume(volume);
      }
    }
  }

  async queueTrack(track: Track): Promise<boolean> {
    if (this.currentTrack === undefined) {
      this.currentTrack = track;
      await this.playTrack(track);
      return true;
    }

    this.queue.push(track);
    return false;
  }

  async pause() {
    await this.player.pause();
  }

  async resume() {
    await this.player.resume();
  }

  clear() {
    this.queue = [];
  }

  async skip(clear = false) {
    if (clear) {
      this.clear();
    }
    await this.player.stop();
  }

  private async playTrack(track: Track) {
    this.currentTrack = track;
    await this.player.play(track);
    if (this.shouldAnnounce) {
      await this.channel.send(`Now playing: **${track.info.title}**`);
    } else {
      this.shouldAnnounce = true;
    }
  }
}
