import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Sets playback volume.')
    .addIntegerOption((option) =>
        option.setName('volume').setDescription('The new volume. Must be at least 0.').setMinValue(0).setRequired(true),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const [good, reason] = isInteractionGood(interaction);

    if (!good) {
        await interaction.reply({ content: reason, ephemeral: true });
        return;
    }

    const scheduler = interaction.client.music.createPlayer(interaction.guildId!);

    if (!scheduler || !scheduler.playing || scheduler.track === undefined) {
        await interaction.reply({ content: 'There is nothing playing.', ephemeral: true });
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

    await scheduler.setVolume(newVol);

    await interaction.reply({ content: `Set volume to **${newVol}**` });
}
