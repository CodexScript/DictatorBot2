import { GuildMember } from 'discord.js';

export const name = 'guildMemberUpdate';
export const once = false;
export const execute = async (oldMember: GuildMember, newMember: GuildMember) => {
  if (oldMember.guild.id === '575404293935595531') {
    const guilds = oldMember.client.guilds.cache;

    const alphaWorld = guilds.get('575404293935595531');

    if (!alphaWorld) {
      return;
    }

    if (oldMember.user.id !== alphaWorld.ownerId && (newMember.nickname === null || newMember.nickname.endsWith('ussy') === false)) {
      await newMember.setNickname(`${newMember.nickname ? newMember.nickname : newMember.user.username}ussy`);
    }
  }
};
