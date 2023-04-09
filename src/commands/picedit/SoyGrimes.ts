import { SlashCommandBuilder } from '@discordjs/builders';
import canvas from '@napi-rs/canvas';
import { ChatInputCommandInteraction } from 'discord.js';
import got from 'got';

export const data = new SlashCommandBuilder()
    .setName('soygrimes')
    .setDescription('Edits your picture to be behind soy Grimes.')
    .addStringOption((option) =>
        option.setName('url').setDescription('A direct download link to the base image.').setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const url = interaction.options.getString('url');

    // url == null is the same as url === undefined || url === null
    if (url == null) {
        await interaction.reply({ content: 'You must specify a URL.', ephemeral: true });
        return;
    }

    try {
        // eslint-disable-next-line no-new
        new URL(url);
    } catch {
        await interaction.reply({ content: 'Invalid URL.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const response = await got.get(url, {
        responseType: 'buffer',
    });

    const contentHeader = response.headers['content-type'];

    if (!contentHeader?.toLowerCase().startsWith('image')) {
        await interaction.followUp({
            content:
                'The URL must be the direct download link to an image.\nTo get this from a Discord attachment, open the attachment preview and click on *Open original*.',
        });
        return;
    }

    const baseImage = await canvas.loadImage(response.body);
    const soy = await canvas.loadImage('./assets/picedit/grimes-soyjack.png');

    const soyCanvas = canvas.createCanvas(soy.width, soy.height);
    const ctx = soyCanvas.getContext('2d');

    ctx.drawImage(baseImage, 0, 0, soy.width, soy.height);
    ctx.drawImage(soy, 0, 0);

    ctx.save();

    await interaction.followUp({ files: [soyCanvas.toBuffer('image/png')] });
}
