import { LoadTracksResponse } from '@lavaclient/types/v3';
import { CommandInteraction, GuildMember } from 'discord.js';

export async function playURL(interaction: CommandInteraction, url: URL) {
    await interaction.deferReply();

    const node = interaction.client.music;

    let res: LoadTracksResponse;

    if (url.host.includes('youtube.com') || url.host.includes('youtu.be')) {
        res = await node.rest.loadTracks(url.toString());
    } else {
        res = await node.rest.loadTracks(`ytsearch:${url.toString()}`);
    }

    if (res.tracks.length === 0) {
        await interaction.reply({ content: 'Could not find any tracks.' });
        return;
    }

    const player = interaction.client.music.createPlayer(interaction.guildId!);

    player.on('trackEnd', async (track, reason) => {
        if (reason === 'REPLACED') {
            return;
        }
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await player.disconnect();
        await player.destroy();
    });

    if (!interaction.member || !(interaction.member instanceof GuildMember)) {
        await interaction.followUp({ content: "You can't use that command here." });
        return;
    }

    const channel = interaction.member.voice.channelId;

    if (!player.connected || player.channelId !== channel) {
        player.connect(channel, { deafened: true });
    }

    player.queue.add(res.tracks[0]);

    if (!player.playing) {
        await interaction.followUp({ content: `Now playing: **${res.tracks[0].info.title}**` });
    } else {
        await interaction.followUp({ content: `Queued: **${res.tracks[0].info.title}**` });
    }

    if (!player.playing) {
        await player.queue.start();
    }
}
