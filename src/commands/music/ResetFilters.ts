import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('resetfilters')
	.setDescription('Resets all player filters.');

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

	await scheduler.player.setFilters({});
	await scheduler.player.setVolume(100);

	await interaction.reply({ content: 'Filters reset.' });
}