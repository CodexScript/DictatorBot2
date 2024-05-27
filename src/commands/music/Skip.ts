import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder().setName('skip').setDescription('Skips the current track.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    scheduler.stop();

    await interaction.reply({ content: `Skipped: **${scheduler.queue.current?.title}**` });
}
