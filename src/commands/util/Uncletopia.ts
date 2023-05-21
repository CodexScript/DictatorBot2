import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import got from 'got';
import { UncletopiaServersResponse } from '../../models/Uncletopia';

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function coordsDistance(lat1: number, long1: number, lat2: number, long2: number) {
    // Radius of the earth in km
    const R = 6371;
    // deg2rad below
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(long2 - long1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Distance in km
    return R * c;
}

export const data = new SlashCommandBuilder()
    .setName('uncletopia')
    .setDescription('Finds best Uncletopia server.')
    .addIntegerOption((option) =>
        option.setName('free_slots').setDescription('The number of free slots to find. Default: 2').setRequired(false),
    )
    .addIntegerOption((option) =>
        option
            .setName('min_players')
            .setDescription('The minimum number of players in the server. Default: 15')
            .setRequired(false),
    )
    .addIntegerOption((option) =>
        option
            .setName('distance')
            .setDescription('The distance to search in km. Must be 500 <= x <= 5000. Default: 1500')
            .setRequired(false),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    let freeSlots = interaction.options.getInteger('free_slots');
    let distance = interaction.options.getInteger('distance');
    let minPlayers = interaction.options.getInteger('min_players');

    if (freeSlots == null) {
        freeSlots = 2;
    }

    if (distance == null) {
        distance = 1500;
    }

    if (minPlayers == null) {
        minPlayers = 15;
    }

    if (distance > 5000 || distance < 500) {
        await interaction.reply({ content: 'Distance must be 500 <= x <= 5000.', ephemeral: true });
        return;
    }

    if (freeSlots < 1) {
        await interaction.reply({ content: 'Free slots must be 1 or more.', ephemeral: true });
        return;
    }

    if (minPlayers < 1) {
        await interaction.reply({ content: 'Minimum players must be 1 or more.', ephemeral: true });
        return;
    }

    await interaction.deferReply();

    const servers = (await got.get('https://uncletopia.com/api/servers/state').json()) as UncletopiaServersResponse;

    for (const server of servers.result) {
        if (
            server.max_players - server.player_count >= freeSlots &&
            minPlayers !== 0 &&
            server.player_count >= minPlayers &&
            distance !== 0 &&
            coordsDistance(40.65965, -73.5434, server.latitude, server.longitude) <= distance
        ) {
            await interaction.followUp({
                content: `Connect using the following URL: steam://connect/${server.host}:${server.port}`,
            });
            return;
        }
    }
}
