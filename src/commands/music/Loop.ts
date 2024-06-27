import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { getSchedulerAfterChecks, isInteractionGood } from '../../util/music.js';

let looping = false;

export const data = new SlashCommandBuilder().setName('loop').setDescription('Loops the current song.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const scheduler = await getSchedulerAfterChecks(interaction);

    if (!scheduler) {
        return;
    }

    scheduler.setTrackRepeat(!looping);

    looping = !looping;

    if (looping) {
        await interaction.reply(`Now looping: **${scheduler.queue.current?.title}**`);
    } else {
        await interaction.reply("No longer looping. Queue will advance after the track ends.");
    }
}
