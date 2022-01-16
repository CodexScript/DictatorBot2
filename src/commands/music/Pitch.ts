import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('pitch')
	.setDescription('Sets playback pitch.')
	.addIntegerOption(option =>
		option.setName('pitch')
			.setDescription('The new pitch. Must be at least 0.')
			.setMinValue(0)
			.setRequired(true));

export async function execute(interaction: CommandInteraction): Promise<void> {
	if (!interaction.guildId || !(interaction.member instanceof GuildMember) || !(interaction.channel instanceof TextChannel)) {
		await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
		return;
	}

	const scheduler = interaction.client.musicManagers.get(interaction.guildId);

	if (!scheduler || scheduler.getTrack() === undefined) {
		await interaction.reply({ content: 'There is nothing playing.', ephemeral: true });
		return;
	}

	const newPitch = interaction.options.getInteger('pitch');

	if (newPitch === null) {
		await interaction.reply({ content: 'You must specify a new pitch.', ephemeral: true });
		return;
	}

	if (newPitch < 0) {
		await interaction.reply({ content: 'Pitch must be a positive integer.', ephemeral: true });
		return;
	}

	if (!scheduler.player.filters.timescale) {
		scheduler.player.filters.timescale = { pitch: newPitch / 100, rate: 1, speed: 1 };
	}
	else {
		scheduler.player.filters.timescale.pitch = newPitch / 100;
	}
	await scheduler.player.setFilters();

	await interaction.reply({ content: `Set pitch to **${newPitch}%**` });
}