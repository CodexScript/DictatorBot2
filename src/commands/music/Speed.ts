import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { getSchedulerAfterChecks } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('speed')
    .setDescription('Sets playback speed.')
    .addIntegerOption((option) =>
        option.setName('speed').setDescription('The new speed. Must be > 0.').setMinValue(1).setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    const newSpeed = interaction.options.getInteger('speed');

    if (newSpeed === null) {
        await interaction.reply({ content: 'You must specify a new speed.', ephemeral: true });
        return;
    }

    if (newSpeed <= 0) {
        await interaction.reply({ content: 'Speed must be greater than 0.', ephemeral: true });
        return;
    }

    scheduler.filters.setTimescale({ speed: newSpeed / 100 });

    await interaction.reply({ content: `Set speed to **${newSpeed}%**` });
}
