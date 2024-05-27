import { SlashCommandBuilder } from '@discordjs/builders';
import canvas from '@napi-rs/canvas';
import { ChatInputCommandInteraction } from 'discord.js';
import { writeText } from '../../util/PicUtils.js';

export const data = new SlashCommandBuilder()
    .setName('mastro')
    .setDescription('Wrties your text on a whiteboard behind Mastro.')
    .addStringOption((option) => option.setName('text').setDescription('Your text.').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text');

    // url == null is the same as url === undefined || url === null
    if (text == null) {
        await interaction.reply({ content: 'You must specify text.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const base = await canvas.loadImage('./assets/picedit/mastro-whiteboard.png');

    const mastroCanvas = canvas.createCanvas(base.width, base.height);
    const ctx = mastroCanvas.getContext('2d');

    const fontSize = Math.max(50 - Math.floor(text.length / 10), 6);

    ctx.drawImage(base, 0, 0);
    ctx.font = `${fontSize}px sans-serif`;
    // ctx.textAlign = 'center';
    ctx.rotate(-0.0035);

    writeText(text, 100, 90, 400, fontSize, ctx);

    await interaction.followUp({ files: [mastroCanvas.toBuffer('image/png')] });
}
