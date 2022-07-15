import { SlashCommandBuilder } from '@discordjs/builders';
import '@lavaclient/queue/register.js';
import { LoadTracksResponse } from '@lavaclient/types';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { addSocialCredit } from '../../util/SocialCreditManager.js';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Tells you the social credit of the specified user.')
  .addStringOption((option) => option.setName('query')
    .setDescription('The URL or search term to play.')
    .setRequired(true));

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.guildId || !(interaction.member instanceof GuildMember) || !(interaction.channel instanceof TextChannel)) {
    await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
    return;
  }

  const query = interaction.options.getString('query');

  if (!query) {
    await interaction.reply('You must specify a query.');
    return;
  }

  await interaction.deferReply();

  const node = interaction.client.music;

  let res: LoadTracksResponse;

  try {
    const url = new URL(query);
    if (url.host.includes('youtube.com') || url.host.includes('youtu.be')) {
      res = await node.rest.loadTracks(query);
    } else {
      res = await node.rest.loadTracks(`ytsearch:${query}`);
    }
  } catch (_) {
    res = await node.rest.loadTracks(`ytsearch:${query}`);
  }

  if (res.tracks.length === 0) {
    await interaction.reply({ content: 'Could not find any tracks.' });
    return;
  }

  for (const blacklist of interaction.client.config.lavalink.linkBlacklist) {
    if (res.tracks[0].info.uri === blacklist) {
      await interaction.reply({ content: 'That link is blacklisted.' });
      return;
    }
  }

  for (const blacklist of interaction.client.config.lavalink.titleBlacklist) {
    if (res.tracks[0].info.title.toLowerCase().includes(blacklist.toLowerCase())) {
      await interaction.reply({ content: 'That track is blacklisted.' });
      return;
    }
  }

  const player = interaction.client.music.createPlayer(interaction.guildId);

  player.on('trackEnd', async (track, reason) => {
    if (reason === 'REPLACED') {
      return;
    }
    // eslint-disable-next-line no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await player.disconnect();
    await player.destroy();
  });

  const channel = interaction.member.voice.channelId;

  if (!player.connected || player.channelId !== channel) {
    player.connect(channel, { deafened: true });
  }

  player.queue.add(res.tracks[0]);

  if (!player.playing) {
    await interaction.followUp({ content: `Now playing: **${res.tracks[0].info.title}**` });
  } else {
    await interaction.followUp({ content: `Queued: **${res.tracks[0].info.title}**` });
  }

  if (!player.playing) {
    await player.queue.start();
  }

  await addSocialCredit(
    interaction.client.sql,
    interaction.user.id,
    1
  );
}
