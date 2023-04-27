import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder().setName('clear').setDescription('Clears the queue.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (
        !interaction.guildId ||
        !(interaction.member instanceof GuildMember) ||
        !(interaction.channel instanceof TextChannel)
    ) {
        await interaction.reply({ content: "You can't use that command here.", ephemeral: true });
        return;
    }

    if (interaction.client.config.bannedFromMusic.includes(interaction.user.id)) {
        await interaction.reply({ content: 'You are banned from doing that.', ephemeral: true });
        return;
    }

    const scheduler = interaction.client.music.createPlayer(interaction.guildId);

    if (!scheduler || scheduler.trackData === undefined) {
        await interaction.reply({ content: 'There is nothing playing.', ephemeral: true });
        return;
    }

    scheduler.queue.clear();

    await interaction.reply({ content: 'Cleared the queue.' });
}
