import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('pitch')
    .setDescription('Sets playback pitch.')
    .addIntegerOption((option) =>
        option.setName('pitch').setDescription('The new pitch. Must be at least 0.').setMinValue(0).setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    const newPitch = interaction.options.getInteger('pitch');

    if (newPitch === null) {
        await interaction.reply({ content: 'You must specify a new pitch.', ephemeral: true });
        return;
    }

    if (newPitch < 0) {
        await interaction.reply({ content: 'Pitch must be a positive integer.', ephemeral: true });
        return;
    }

    scheduler.filters.setTimescale({ pitch: newPitch / 100 });

    await interaction.reply({ content: `Set pitch to **${newPitch}%**` });
}
