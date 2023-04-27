import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Skips the current track and clears the queue.');

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

    await scheduler.stop();
    await scheduler.disconnect();
    await scheduler.destroy();

    await interaction.reply({ content: 'Stopped.' });
}
