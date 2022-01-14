import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { TrackScheduler } from '../../util/music/TrackScheduler.js';

export const data = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Tells you the social credit of the specified user.')
	.addStringOption(option =>
		option.setName('query')
			.setDescription('The URL or search term to play.')
			.setRequired(true));

export async function execute(interaction: CommandInteraction): Promise<void> {
	if (!interaction.guildId || !(interaction.member instanceof GuildMember) || !(interaction.channel instanceof TextChannel)) {
		await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
		return;
	}

	const query = interaction.options.getString('query');

	if (!query) {
		await interaction.reply('You must specify a query.');
		return;
	}

	await interaction.deferReply();

	const node = interaction.client.music;

	const res = await node.rest.loadTracks(`ytsearch:${query}`);

	if (res.tracks.length === 0) {
		await interaction.reply({ content: 'Could not find any tracks.' });
		return;
	}

	const player = await node.createPlayer(interaction.guildId);

	let scheduler = interaction.client.musicManagers.get(interaction.guildId);

	if (!scheduler) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		scheduler = new TrackScheduler(player, interaction.channel!);
		interaction.client.musicManagers.set(interaction.guildId, scheduler);
	}

	const channel = interaction.member.voice.channelId;

	await player.connect(channel, { deafened: true });

	const playNow = await scheduler.queueTrack(res.tracks[0]);

	if (playNow) {
		await interaction.followUp({ content: `Now playing: **${res.tracks[0].info.title}**` });
	}
	else {
		await interaction.followUp({ content: `Queued: **${res.tracks[0].info.title}**` });
	}

}