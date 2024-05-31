import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { getSchedulerAfterChecks } from '../../util/music.js';

export const data = new SlashCommandBuilder().setName('resetfilters').setDescription('Resets all player filters.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    await scheduler.filters.clearFilters();

    await interaction.reply({ content: 'Filters reset.' });
}
