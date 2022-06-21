import { GuildMember } from 'discord.js';

export const name = 'guildMemberUpdate';
export const once = false;
export const execute = async (oldMember: GuildMember, newMember: GuildMember) => {
  if (oldMember.guild.id === '575404293935595531') {
    if ((newMember.nickname === null || newMember.nickname.endsWith('ussy') === false)) {
      const bot = await oldMember.guild.members.fetch(newMember.client!.user!.id!);
      if (bot.permissions.has('MANAGE_NICKNAMES') && bot.roles.highest.position > newMember.roles.highest.position) {
        await newMember.setNickname(`${newMember.nickname ? newMember.nickname : newMember.user.username}ussy`);
      }
    }
  }
};
