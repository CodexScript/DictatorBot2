import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('skip')
  .setDescription('Skips the current track.');

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.guildId || !(interaction.member instanceof GuildMember) || !(interaction.channel instanceof TextChannel)) {
    await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
    return;
  }

  const scheduler = interaction.client.music.createPlayer(interaction.guildId);

  if (!scheduler || scheduler.trackData === undefined) {
    await interaction.reply({ content: 'There is nothing playing.', ephemeral: true });
    return;
  }

  await interaction.reply({ content: `Skipped: **${scheduler.trackData?.title}**` });
  await scheduler.queue.skip();
  await scheduler.queue.start();
}
