import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { addSocialCredit } from '../../util/SocialCreditManager.js';
import { isInteractionGood } from '../../util/music.js';

let state = false;

function generateBands(startingBand: number, zeroed = false) {
    const bands = [];
    if (zeroed) {
        for (let i = startingBand; i < 15; i++) {
            bands.push({ band: i, gain: 0 });
        }
    } else {
        const iterValue = 0.25 / (15 - startingBand);
        let iter = 0;
        for (let i = startingBand; i < 15; i++) {
            iter -= iterValue;
            bands.push({ band: i, gain: iter });
        }
    }
    return bands;
}

export const data = new SlashCommandBuilder()
    .setName('underwater')
    .setDescription('Toggles the "underwater" effect found on a lot of modern rap songs.');

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

    if (!state) {
        scheduler.filters.equalizer = generateBands(5);
    } else {
        scheduler.filters.equalizer = generateBands(5, true);
    }

    state = !state;

    await scheduler.setFilters();

    await interaction.reply({ content: `Toggled underwater to **${state}**` });
}
