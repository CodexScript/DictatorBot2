import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Sets playback volume.')
    .addIntegerOption((option) =>
        option.setName('volume').setDescription('The new volume. Must be at least 0.').setMinValue(0).setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    const newVol = interaction.options.getInteger('volume');

    if (!newVol) {
        await interaction.reply({ content: 'You must specify a new volume.', ephemeral: true });
        return;
    }

    if (newVol < 0) {
        await interaction.reply({ content: 'Volume must be a positive integer.', ephemeral: true });
        return;
    }

    scheduler.setVolume(newVol);

    await interaction.reply({ content: `Set volume to **${newVol}**` });
}
