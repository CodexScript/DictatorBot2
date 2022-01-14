import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('play')
	.setDescription('Tells you the social credit of the specified user.')
	.addStringOption(option =>
		option.setName('query')
			.setDescription('The URL or search term to play.')
			.setRequired(true));

export async function execute(interaction: CommandInteraction): Promise<void> {
	if (!interaction.guildId || !(interaction.member instanceof GuildMember)) {
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

	const player = await node.createPlayer(interaction.guildId);

	const channel = interaction.member.voice.channelId;

	await player.connect(channel, { deafened: true });

	const res = await node.rest.loadTracks(`ytsearch:${query}`);
	await player.play(res.tracks[0]);
	await interaction.followUp({ content: 'Hopefully we are playing now' });

}