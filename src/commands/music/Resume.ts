import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { isInteractionGood } from '../util/music.js';

export const data = new SlashCommandBuilder().setName('resume').setDescription('Resumes the current track.');

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

    await scheduler.pause(false);

    await interaction.reply({ content: 'Resumed.' });
}
