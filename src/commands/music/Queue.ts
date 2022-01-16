import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('queue')
	.setDescription('Lists the current queue.');

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

	if (scheduler.length === 0) {
		await interaction.reply({ content: 'There is nothing in the queue.', ephemeral: true });
		return;
	}

	let queueString = '';
	scheduler.getQueue().forEach((track, index) => {
		queueString += `${index + 1}. ${track.info.title}\n`;
	});

	await interaction.reply({ content: '```\n' + queueString + '\n```', ephemeral: true });
}