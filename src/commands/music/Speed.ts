import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { addSocialCredit } from '../../util/SocialCreditManager.js';
import { isInteractionGood } from '../util/music.js';

export const data = new SlashCommandBuilder()
    .setName('speed')
    .setDescription('Sets playback speed.')
    .addIntegerOption((option) =>
        option.setName('speed').setDescription('The new speed. Must be > 0.').setMinValue(1).setRequired(true),
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

    const newSpeed = interaction.options.getInteger('speed');

    if (newSpeed === null) {
        await interaction.reply({ content: 'You must specify a new speed.', ephemeral: true });
        return;
    }

    if (newSpeed <= 0) {
        await interaction.reply({ content: 'Speed must be greater than 0.', ephemeral: true });
        return;
    }

    if (!scheduler.filters.timescale) {
        scheduler.filters.timescale = { pitch: 1, rate: 1, speed: newSpeed / 100 };
    } else {
        scheduler.filters.timescale.speed = newSpeed / 100;
    }
    await scheduler.setFilters();

    await interaction.reply({ content: `Set speed to **${newSpeed}%**` });
}
