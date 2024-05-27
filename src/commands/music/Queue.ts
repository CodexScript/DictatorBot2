import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

export const data = new SlashCommandBuilder().setName('queue').setDescription('Lists the current queue.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    if (scheduler.queue.size === 0) {
        await interaction.reply({ content: 'There is nothing in the queue.', ephemeral: true });
        return;
    }

    let queueString = '';
    queueString += `Now playing: ${scheduler.queue.current?.title}`;
    scheduler.queue.forEach((track, index) => {
        queueString += `${index + 1}. ${track.title}\n`;
    });

    await interaction.reply({ content: `\`\`\`\n${queueString}\n\`\`\``, ephemeral: true });
}
