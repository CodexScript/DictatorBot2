import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';

export function isInteractionGood(interaction: ChatInputCommandInteraction): [boolean, string] {
    if (
        !interaction.guildId ||
        !(interaction.member instanceof GuildMember) ||
        !(interaction.channel instanceof TextChannel)
    ) {
        return [false, "You can't use that command here."];
    }

    if (interaction.client.config.bannedFromMusic.includes(interaction.user.id)) {
        return [false, "You're banned from using music commands."];
    }
    if (interaction.client.config.guildsBannedFromMusic.includes(interaction.guildId)) {
        return [
            false,
            'This server is banned from using music commands. **If you move servers, music bot will work normally there.**',
        ];
    }
    return [true, ''];
}
