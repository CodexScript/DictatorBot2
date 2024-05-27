import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel, VoiceChannel } from 'discord.js';
import { isInteractionGood } from '../../util/music.js';
import { SearchResult } from 'magmastream';

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

    let res: SearchResult;

    // try {
    //     new URL(query); // If this doesn't throw, it's a URL
    //     res = await node.rest.loadTracks(query);
    // } catch (_) {
    //     res = await node.rest.loadTracks(`ytsearch:${query}`);
    // }

    try {
        res = await node.search(query, interaction.user);
        if (res.loadType === 'empty') {
            await interaction.followUp({ content: 'Could not find any tracks.' });
            return;
        }
    } catch (err) {
        // @ts-ignore
        await interaction.followUp({ content: `There was an error while searching: ${err.message}` });
        return;
    }

    const player = interaction.client.music.create({
        guild: interaction.guildId!,
        voiceChannel: channel,
        textChannel: interaction.channel!.id,
        volume: 100,
    });

    if (player.state !== 'CONNECTED') player.connect();
    player.queue.add(res.tracks[0]);

    if (!player.playing && !player.paused && !player.queue.length) {
        console.log('Now we play');
        await player.play();
    }

    if (player.queue.size === 0) {
        await interaction.followUp({ content: `Now playing: **${res.tracks[0].title}**` });
    } else {
        await interaction.followUp({ content: `Queued: **${res.tracks[0].title}**` });
    }
}
