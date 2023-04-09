import { SlashCommandBuilder } from '@discordjs/builders';
import canvas from '@napi-rs/canvas';
import { ChatInputCommandInteraction } from 'discord.js';
import got from 'got';
import { isValidHttpUrl, writeText } from '../../util/PicUtils.js';
import * as SocialCreditManager from '../../util/SocialCreditManager.js';

export const data = new SlashCommandBuilder()
    .setName('ethan')
    .setDescription('Puts your picture or writes your text behind Ethan Grimes in a suit.')
    .addStringOption((option) => option.setName('text').setDescription('Your text or URL.').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text');

    // url == null is the same as url === undefined || url === null
    if (text == null) {
        await interaction.reply({ content: 'You must specify text.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const base = await canvas.loadImage('./assets/picedit/ethan-whiteboard.png');

    const ethanCanvas = canvas.createCanvas(base.width, base.height);
    const ctx = ethanCanvas.getContext('2d');

    if (isValidHttpUrl(text)) {
        const response = await got.get(text, {
            responseType: 'buffer',
        });

        const contentHeader = response.headers['content-type'];

        if (contentHeader === undefined || !contentHeader.toLowerCase().startsWith('image')) {
            await interaction.followUp({
                content:
                    'The URL must be the direct download link to an image.\nTo get this from a Discord attachment, open the attachment preview and click on *Open original*.',
            });
            return;
        }

        const responseImage = await canvas.loadImage(response.body);

        ctx.drawImage(responseImage, 265, 225, 969, 770);

        ctx.drawImage(base, 0, 0);
    } else {
        const fontSize = Math.max(75 - Math.floor(text.length / 10), 6);

        ctx.fillStyle = '#ffffff';
        ctx.rect(265, 225, 969, 770);
        ctx.fill();
        ctx.drawImage(base, 0, 0);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.rotate(0.0035);

        writeText(text, 315, 325, 800, fontSize, ctx);
    }

    ctx.save();

    await interaction.followUp({ files: [ethanCanvas.toBuffer('image/png')] });
}
