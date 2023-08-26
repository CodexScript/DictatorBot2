import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Skips the current track and clears the queue.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const [good, reason] = isInteractionGood(interaction);

    if (!good) {
        await interaction.reply({ content: reason, ephemeral: true });
        return;
    }

    const scheduler = interaction.client.music.createPlayer(interaction.guildId!);

    await scheduler.stop();
    await scheduler.disconnect();
    await scheduler.destroy();

    await interaction.reply({ content: 'Stopped.' });
}
