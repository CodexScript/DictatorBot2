import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

// Album IDs, each represents an imgur url. eg. QtYaS = https://imgur.com/a/QtYaS
const GROSS_UPS = [
    ['QtYaS', 'Jz0rf', 'eEeh0'],
    ['Hab15', 'BqkYV', 'h3pL8', 'YhmOo'],
    ['ff1aO', '9DRTn', 'SDaSy', '1f2Uk'],
];

export const data = new SlashCommandBuilder()
    .setName('grossup')
    .setDescription('Sends a random gross-up from SpongeBob (Seasons 1-3).');

export async function execute(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    const season = Math.floor(Math.random() * 3) + 1;
    const grossUp = GROSS_UPS[season - 1][Math.floor(Math.random() * GROSS_UPS[season - 1].length)];

    const album = await interaction.client.imgur.getAlbum(grossUp);

    const image = album.data.images[Math.floor(Math.random() * album.data.images.length)];

    await interaction.followUp({ files: [image.link] });
}
