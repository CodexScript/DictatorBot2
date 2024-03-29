import { SlashCommandBuilder } from '@discordjs/builders';
import '@lavaclient/queue/register';
import { LoadTracksResponse } from '@lavaclient/types/v3';
import { ChatInputCommandInteraction, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music on the bot.')
    .addStringOption((option) =>
        option.setName('query').setDescription('The URL or search term to play.').setRequired(true),
    )
    .addChannelOption((option) =>
        option.setName('channel').setDescription('The channel to play in.').setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const [good, reason] = isInteractionGood(interaction);

    if (!good) {
        await interaction.reply({ content: reason, ephemeral: true });
        return;
    }

    const query = interaction.options.getString('query');

    if (!query) {
        await interaction.reply({ content: 'You must specify a query.', ephemeral: true });
        return;
    }

    let channel = interaction.options.getChannel('channel')?.id;

    if (channel) {
        const tmpChannel = await interaction.guild?.channels.fetch(channel);
        if (!(tmpChannel instanceof VoiceChannel)) {
            await interaction.reply({
                content: 'You must specify a voice channel.',
                ephemeral: true,
            });
            return;
        }
    } else {
        channel = (interaction.member as GuildMember).voice.channel?.id;
    }

    if (!channel) {
        await interaction.reply({
            content: 'Could not locate voice channel. If you are not in voice, join and try again.',
            ephemeral: true,
        });
        return;
    }

    await interaction.deferReply();

    const node = interaction.client.music;

    let res: LoadTracksResponse;

    try {
        new URL(query); // If this doesn't throw, it's a URL
        res = await node.rest.loadTracks(query);
    } catch (_) {
        res = await node.rest.loadTracks(`ytsearch:${query}`);
    }

    if (res.tracks.length === 0) {
        await interaction.followUp({ content: 'Could not find any tracks.' });
        return;
    }
    const player = interaction.client.music.createPlayer(interaction.guildId!);

    player.on('trackEnd', async (_, __) => {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!player.playing) {
            await player.disconnect();
            await player.destroy();
        }
    });

    if (!player.connected || player.channelId !== channel) {
        player.connect(channel, { deafened: true });
    }

    player.queue.add(res.tracks[0]);

    if (!player.playing) {
        await interaction.followUp({ content: `Now playing: **${res.tracks[0].info.title}**` });
        await player.queue.start();
    } else {
        await interaction.followUp({ content: `Queued: **${res.tracks[0].info.title}**` });
    }
}
