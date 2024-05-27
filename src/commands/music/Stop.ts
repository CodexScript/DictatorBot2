import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Skips the current track and clears the queue.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    scheduler.stop();
    scheduler.disconnect();
    scheduler.destroy();

    await interaction.reply({ content: 'Stopped.' });
}
