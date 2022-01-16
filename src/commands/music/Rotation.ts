import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('rotation')
	.setDescription('Sets rotation speed.')
	.addNumberOption(option =>
		option.setName('speed')
			.setDescription('The new speed. Must be at least 0.')
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

	const newSpeed = interaction.options.getNumber('speed');

	if (newSpeed === null) {
		await interaction.reply({ content: 'You must specify a new speed.', ephemeral: true });
		return;
	}

	if (newSpeed < 0) {
		await interaction.reply({ content: 'Speed must be at least 0.', ephemeral: true });
		return;
	}

	scheduler.player.filters.rotation = { rotationHz: newSpeed };
	await scheduler.player.setFilters();

	await interaction.reply({ content: `Set rotation speed to **${newSpeed}Hz**` });
}