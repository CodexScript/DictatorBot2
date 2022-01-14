import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import * as SocialCreditManager from '../../util/SocialCreditManager.js';

export const data = new SlashCommandBuilder()
	.setName('socialcredit')
	.setDescription('Tells you the social credit of the specified user.')
	.addUserOption(option =>
		option.setName('user')
			.setDescription('The user to check the social credit of.')
			.setRequired(false));

export async function execute(interaction: CommandInteraction): Promise<void> {
	const user = interaction.options.getMember('user');

	let targetUser = interaction.member;
	if (user instanceof GuildMember) {
		targetUser = user;
	}

	if (!(targetUser instanceof GuildMember)) {
		await interaction.reply({ content: 'Could not find user.', ephemeral: true });
		return;
	}

	await interaction.deferReply({ ephemeral: true });

	const flag = await SocialCreditManager.createUserBanner(targetUser);
	await interaction.followUp({ files:[flag] });

}