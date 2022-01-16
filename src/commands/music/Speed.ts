import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('speed')
	.setDescription('Sets playback speed.')
	.addIntegerOption(option =>
		option.setName('speed')
			.setDescription('The new speed. Must be > 0.')
			.setMinValue(1)
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

	const newSpeed = interaction.options.getInteger('speed');

	if (newSpeed === null) {
		await interaction.reply({ content: 'You must specify a new speed.', ephemeral: true });
		return;
	}

	if (newSpeed <= 0) {
		await interaction.reply({ content: 'Speed must be greater than 0.', ephemeral: true });
		return;
	}

	if (!scheduler.player.filters.timescale) {
		scheduler.player.filters.timescale = { pitch: 1, rate: 1, speed: newSpeed / 100 };
	}
	else {
		scheduler.player.filters.timescale.speed = newSpeed / 100;
	}
	await scheduler.player.setFilters();

	await interaction.reply({ content: `Set speed to **${newSpeed}%**` });
}