import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('nick')
  .setDescription('Changes nickname of the bot.')
  .addStringOption((option) => option.setName('guild_id')
    .setDescription('The ID of the guild to change the nickname in.')
    .setRequired(true))
  .addStringOption((option) => option.setName('nickname')
    .setDescription('The nickname to change to. Do not specify a nickname in order to reset.')
    .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (interaction.user.id != interaction.client.config.ownerID) {
    await interaction.reply({ content: 'You can\'t use that command.', ephemeral: true });
    return;
  }
  if (!interaction.guildId || !(interaction.member instanceof GuildMember)
|| !(interaction.channel instanceof TextChannel)) {
    await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
  }

  const guildID = interaction.options.getString('guild_id');
  const nickname = interaction.options.getString('nickname');

  if (!guildID) {
    await interaction.reply({ content: 'You must specify a guild ID.', ephemeral: true });
    return;
  }

  const guild = interaction.client.guilds.cache.get(guildID);

  if (!guild) {
    await interaction.reply({ content: 'Could not find that guild.', ephemeral: true });
    return;
  }

  const member = guild.members.cache.get(interaction.client.user!.id);

  if (!member) {
    await interaction.reply({ content: 'Could not find myself in that guild.', ephemeral: true });
    return;
  }

  if (!nickname) {
    await member.setNickname(null);
  } else {
    await member.setNickname(nickname);
  }

  await interaction.reply({ content: `Nickname changed to **${nickname}**.`, ephemeral: true });
}
