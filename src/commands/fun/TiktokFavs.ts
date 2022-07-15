import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { EventEmitter } from 'events';
import got from 'got';
import { addSocialCredit } from '../../util/SocialCreditManager.js';
import { TiktokManager } from '../../util/TiktokManager.js';

let manager: TiktokManager | undefined;
const bus = new EventEmitter();

export const data = new SlashCommandBuilder()
  .setName('tiktokfavs')
  .setDescription('Grabs a random CCP-approved TikTok video.')
  .addIntegerOption((option) => option.setName('index')
    .setDescription('Array index.')
    .setRequired(false))
  .addBooleanOption((option) => option.setName('force-update')
    .setDescription('Force the list of favorites to update. Only President Xi may use')
    .setRequired(false));

export async function execute(interaction: CommandInteraction): Promise<void> {
  const index = interaction.options.getInteger('index');
  let force = interaction.options.getBoolean('force-update');

  if (interaction.channel === null) {
    await interaction.reply({ content: 'You can\'t use that command here', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  if (interaction.user.id !== interaction.client.config.ownerID) {
    force = false;
  }

  if (!manager) {
    manager = new TiktokManager(interaction.client.config.tiktok);
  }

  if (force || manager.videos.length === 0 || new Date().getTime() - manager.lastFetch.getTime() > 21600000) {
    const waitMessage = await interaction.channel.send('Populating TikTok favorites list. This may take awhile...');
    await manager.populateFavs(bus);
    await waitMessage.delete();
  }

  if (manager.isFetching) {
    const waitMessage = await interaction.channel.send('Populating TikTok favorites list. This may take awhile...');
    await new Promise((resolve) => bus.once('unlocked', resolve));
    await waitMessage.delete();
  }

  let fav;

  if (index === null) {
    while (fav === undefined) {
      const tempFav = manager.videos[Math.floor(Math.random() * manager.videos.length)];
      if (tempFav.play_addr && tempFav.play_addr.url_list) {
        fav = tempFav;
      }
    }
  } else if (index < 0) {
    fav = manager.videos[manager.videos.length + index];
  } else {
    fav = manager.videos[index];
  }

  if (fav === undefined) {
    await interaction.followUp({ content: 'Invalid index.' });
    return;
  }

  const buffer = await got.get(fav.play_addr!.url_list[fav.play_addr!.url_list.length - 1])
    .buffer();

  await interaction.followUp({ files: [{ name: 'tiktok.mp4', attachment: buffer }] });

  await addSocialCredit(
    interaction.client.sql,
    interaction.user.id,
    10
  );
}
