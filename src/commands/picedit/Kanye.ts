import { SlashCommandBuilder } from '@discordjs/builders';
import canvas from 'canvas';
import { CommandInteraction } from 'discord.js';
import { writeText } from '../../util/PicUtils.js';
import * as SocialCreditManager from '../../util/SocialCreditManager.js';

export const data = new SlashCommandBuilder()
	.setName('kanye')
	.setDescription('Wrties your text on a notepad in front of Kanye.')
	.addStringOption(option =>
		option.setName('text')
			.setDescription('Your text.')
			.setRequired(true),
	);

export async function execute(interaction: CommandInteraction): Promise<void> {
	const text = interaction.options.getString('text');

	// url == null is the same as url === undefined || url === null
	if (text == null) {
		await interaction.reply({ content: 'You must specify text.', ephemeral: true });
		return;
	}

	await interaction.deferReply();

	const base = await canvas.loadImage('./assets/picedit/kanye-notepad.jpg');

	const kanyeCanvas = canvas.createCanvas(base.width, base.height);
	const ctx = kanyeCanvas.getContext('2d');

	const fontSize = 50 - Math.floor(text.length / 10);

	ctx.drawImage(base, 0, 0);
	ctx.font = `${fontSize}px sans-serif`;
	// ctx.textAlign = 'center';
	ctx.rotate(-0.0035);

	writeText(text, 536, 905, 500, fontSize, ctx);

	await interaction.followUp({ files: [kanyeCanvas.toBuffer()] });
	await SocialCreditManager.addSocialCredit(interaction.user.id, 10);
}