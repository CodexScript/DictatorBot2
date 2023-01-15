import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

let lastExecuted: Date | undefined;

export const data = new SlashCommandBuilder()
  .setName('ussifier')
  .setDescription('Ussifies.');

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (interaction.user.id !== '145639018955014154' && interaction.user.id !== '247926505638723586') {
    await interaction.reply({ content: 'You can\'t use that command.', ephemeral: true });
    return;
  }

  if (lastExecuted !== undefined && lastExecuted.getTime() < Date.now() + 900000) {
    await interaction.reply({ content: 'You can\'t use that command too often.', ephemeral: true });
    return;
  }

  lastExecuted = new Date();

  const alphaWorld = await interaction.client.guilds.fetch('575404293935595531');

  if (!alphaWorld) {
    await interaction.reply({ content: 'Fetching Alpha World server from cache failed. I\'m probably not in the server. If you are 100% positive that I am, try sending a message in the general channel, then try again.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const bot = await alphaWorld.members.fetch(interaction.client.user!.id!);

  const members = await alphaWorld.members.list({ limit: 1000 });

  for (const memberArr of members) {
    const member = memberArr[1];
    console.log(member.user.username);
    if (member.user.id !== interaction.client.user?.id && bot.permissions.has('ManageNicknames') && bot.roles.highest.position > member.roles.highest.position && (member.nickname === null || member.nickname.endsWith('ussy') === false)) {
      await member.setNickname(`${member.nickname ? member.nickname : member.user.username}ussy`);
    }
  }

  await interaction.followUp({ content: 'Ussified.' });
}
