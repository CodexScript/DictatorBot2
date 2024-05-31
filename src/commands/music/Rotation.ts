import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { getSchedulerAfterChecks } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('rotation')
    .setDescription('Sets rotation speed.')
    .addNumberOption((option) =>
        option.setName('speed').setDescription('The new speed. Must be at least 0.').setMinValue(0).setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    const newSpeed = interaction.options.getNumber('speed');

    if (newSpeed === null) {
        await interaction.reply({ content: 'You must specify a new speed.', ephemeral: true });
        return;
    }

    if (newSpeed < 0) {
        await interaction.reply({ content: 'Speed must be at least 0.', ephemeral: true });
        return;
    }

    scheduler.filters.setRotation({ rotationHz: newSpeed });

    await interaction.reply({ content: `Set rotation speed to **${newSpeed}Hz**` });
}
