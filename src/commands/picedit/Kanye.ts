import { SlashCommandBuilder } from '@discordjs/builders';
import canvas from '@napi-rs/canvas';
import { ChatInputCommandInteraction } from 'discord.js';
import axios from 'axios';
import { isValidHttpUrl, writeText } from '../../util/PicUtils.js';

export const data = new SlashCommandBuilder()
    .setName('kanye')
    .setDescription('Puts your picture or wrties your text on a notepad in front of Kanye.')
    .addStringOption((option) => option.setName('text').setDescription('Your text or URL.').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text');

    // url == null is the same as url === undefined || url === null
    if (text == null) {
        await interaction.reply({ content: 'You must specify text.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const base = await canvas.loadImage('./assets/picedit/kanye-notepad.jpg');
    const hands = await canvas.loadImage('./assets/picedit/kanye-hands.png');

    const kanyeCanvas = canvas.createCanvas(base.width, base.height);
    const ctx = kanyeCanvas.getContext('2d');

    if (isValidHttpUrl(text)) {
        const response = await axios.get(text, {
            responseType: 'arraybuffer',
        });

        const contentHeader = response.headers['content-type'];

        if (contentHeader === undefined || !contentHeader.toLowerCase().startsWith('image')) {
            await interaction.followUp({
                content:
                    'The URL must be the direct download link to an image.\nTo get this from a Discord attachment, open the attachment preview and click on *Open original*.',
            });
            return;
        }

        const responseImage = await canvas.loadImage(response.data);

        ctx.drawImage(base, 0, 0);

        ctx.drawImage(responseImage, 449, 810, 570, 661);

        ctx.drawImage(hands, 0, 0);
    } else {
        const fontSize = 50 - Math.max(Math.floor(text.length / 10), 6);
        ctx.drawImage(base, 0, 0);
        ctx.font = `${fontSize}px sans-serif`;

        writeText(text, 536, 905, 500, fontSize, ctx);

        ctx.drawImage(hands, 0, 0);
    }

    ctx.save();

    await interaction.followUp({ files: [kanyeCanvas.toBuffer('image/png')] });
}
