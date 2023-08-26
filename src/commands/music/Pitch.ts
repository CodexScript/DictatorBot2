import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('pitch')
    .setDescription('Sets playback pitch.')
    .addIntegerOption((option) =>
        option.setName('pitch').setDescription('The new pitch. Must be at least 0.').setMinValue(0).setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const [good, reason] = isInteractionGood(interaction);

    if (!good) {
        await interaction.reply({ content: reason, ephemeral: true });
        return;
    }

    const scheduler = interaction.client.music.createPlayer(interaction.guildId!);

    if (!scheduler || scheduler.trackData === undefined) {
        await interaction.reply({ content: 'There is nothing playing.', ephemeral: true });
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

    if (!scheduler.filters.timescale) {
        scheduler.filters.timescale = { pitch: newPitch / 100, rate: 1, speed: 1 };
    } else {
        scheduler.filters.timescale.pitch = newPitch / 100;
    }
    await scheduler.setFilters();

    await interaction.reply({ content: `Set pitch to **${newPitch}%**` });
}
