import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { addSocialCredit } from '../../util/SocialCreditManager.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

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
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    if (!state) {
        scheduler.filters.setEqualizer(generateBands(5));
    } else {
        scheduler.filters.setEqualizer(generateBands(5, true));
    }

    state = !state;

    await interaction.reply({ content: `Toggled underwater to **${state}**` });
}
