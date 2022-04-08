import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import fs from 'fs/promises';
import got from 'got';

// Album IDs, each represents an imgur url. eg. QtYaS = https://imgur.com/a/QtYaS
const TITLE_CARDS_ADVENTURE_TIME = 'bMUUI';

export const data = new SlashCommandBuilder()
  .setName('titlecard')
  .setDescription('Sends a random title card from the specified show.')
  .addStringOption((option) => option.setName('show')
    .setDescription('The show to get a title card from.')
    .setRequired(false)
    .addChoice('Adventure Time', 'adventure_time')
    .addChoice('SpongeBob', 'spongebob'));

export async function execute(interaction: CommandInteraction): Promise<void> {
  const show = interaction.options.getString('show');

  if (show && show !== 'adventure_time' && show !== 'spongebob') {
    await interaction.reply({ content: 'Invalid show.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  let titleCard;

  if (!show || show === 'spongebob') {
    const links = await fs.readFile('./assets/sb_titlecards.json', 'utf8');
    const linksData = JSON.parse(links);
    titleCard = linksData[Math.floor(Math.random() * linksData.length)];
  } else if (show === 'adventure_time') {
    const album = await interaction.client.imgur.getAlbum(TITLE_CARDS_ADVENTURE_TIME);
    titleCard = album.data.images[Math.floor(Math.random() * album.data.images.length)].link;
  }

  const headers = await got.head(titleCard);

  if (!headers.headers['content-type']?.startsWith('image')) {
    await interaction.followUp({ content: `Invalid title card received from Imgur. Please try again. Title card chosen: ${titleCard}` });
    return;
  }

  await interaction.followUp({ files: [{ attachment: titleCard, name: `titlecard.${headers.headers['content-type'].split('image/')[1]}` }], });
}
