import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import {getSchedulerAfterChecks, isInteractionGood} from '../../util/music.js';

export const data = new SlashCommandBuilder().setName('resume').setDescription('Resumes the current track.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    scheduler.pause(false);

    await interaction.reply({ content: 'Resumed.' });
}
