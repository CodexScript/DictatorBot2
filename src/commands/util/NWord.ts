import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('nword')
	.setDescription('Finds how many times the specified user has said the N word.')
	.addUserOption(option =>
		option.setName('user')
			.setDescription('The user to find the amount of N words for.')
			.setRequired(true),
	)
	.addBooleanOption(option =>
		option.setName('verbose')
			.setDescription('Exports a detailed log to a text file if set to true.')
			.setRequired(false),
	);


export async function execute(interaction: CommandInteraction): Promise<void> {
	const user = interaction.options.getUser('user');
	let verbose = interaction.options.getBoolean('verbose');

	if (user == null) {
		await interaction.reply({ content: 'You must specify a user.', ephemeral: true });
		return;
	}

	if (interaction.guild == null || !interaction.guild.available) {
		await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		return;
	}

	if (verbose == null) {
		verbose = false;
	}

	await interaction.deferReply();

	const channels = await interaction.guild.channels.fetch();

	let nWordCount = 0;
	let hardRCount = 0;

	if (verbose) {
		let logString = '';
		for (const channel of channels.values()) {
			if (channel.type !== 'GUILD_TEXT') {
				continue;
			}

			const messages = await channel.messages.fetch();

			for (let i = 0; i < messages.size; i++) {
				const message = messages.at(i);
				if (message == null) {
					continue;
				}
				if (message.author.id === user.id) {
					const content = message.content.toLowerCase();

					const messageNWordCount = (content.match(new RegExp('(nigga)', 'gi')) || []).length;
					const messageHardRCount = (content.match(new RegExp('(nigger)', 'gi')) || []).length;

					nWordCount += messageNWordCount;
					hardRCount += messageHardRCount;

					if (messageHardRCount > 0 || messageNWordCount > 0) {
						logString += `URL: ${message.url}\n${message.createdAt} in #${channel.name}:\n`;

						const messageBefore = messages.at(i - 1);
						if (messageBefore !== undefined) {
							logString += `Message before: <${messageBefore.author.tag}> ${messageBefore.content}\n`;
						}

						logString += `Offending message: <${message.author.tag}> ${message.content}\n`;

						const messageAfter = messages.at(i + 1);
						if (messageAfter !== undefined) {
							logString += `Message after: <${messageAfter.author.tag}> ${messageAfter.content}\n`;
						}

						logString += '================\n';
					}
				}
			}
		}

		logString = `User: ${user.tag}\n================\nN Word Count: ${nWordCount}\nHard R Count: ${hardRCount}\nTotal: ${nWordCount + hardRCount}\n================\n` + logString;
		const logBuffer = Buffer.from(logString, 'utf-8');
		await interaction.followUp({ content: `${user.tag} has said the N word ${nWordCount + hardRCount} times in this guild. ${nWordCount} ended with a, and ${hardRCount} ended with er.`, files: [{ attachment: logBuffer, name: 'nword.log' }] });
	}
	else {
		for (const channel of channels.values()) {
			if (channel.type !== 'GUILD_TEXT') {
				continue;
			}

			const messages = await channel.messages.fetch();

			for (const message of messages.values()) {
				if (message.author.id === user.id) {
					const content = message.content.toLowerCase();

					nWordCount += (content.match(new RegExp('(nigga)', 'gi')) || []).length;
					hardRCount += (content.match(new RegExp('(nigger)', 'gi')) || []).length;
				}
			}
		}

		await interaction.followUp({ content: `${user.tag} has said the N word ${nWordCount + hardRCount} times in this guild. ${nWordCount} ended with a, and ${hardRCount} ended with er.` });
	}
}