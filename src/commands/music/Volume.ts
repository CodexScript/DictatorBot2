import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('volume')
	.setDescription('Sets playback volume.')
	.addIntegerOption(option =>
		option.setName('volume')
			.setDescription('The new volume. Must be at least 0.')
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

	const newVol = interaction.options.getInteger('volume');

	if (!newVol) {
		await interaction.reply({ content: 'You must specify a new volume.', ephemeral: true });
		return;
	}

	if (newVol < 0) {
		await interaction.reply({ content: 'Volume must be a positive integer.', ephemeral: true });
		return;
	}

	await scheduler.player.setVolume(newVol);

	await interaction.reply({ content: `Set volume to **${newVol}**` });
}