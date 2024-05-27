import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { Player } from 'magmastream';

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

export async function getSchedulerAfterChecks(interaction: ChatInputCommandInteraction): Promise<Player | null> {
    const [good, reason] = isInteractionGood(interaction);

    if (!good) {
        await interaction.reply({ content: reason, ephemeral: true });
        return null;
    }

    const scheduler = interaction.client.music.players.get(interaction.guildId!);

    if (!scheduler || (!scheduler.playing && !scheduler.paused)) {
        await interaction.reply({ content: 'There is nothing playing.', ephemeral: true });
        return null;
    }

    return scheduler;
}
