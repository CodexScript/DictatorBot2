import {
    ActionRowBuilder,
    ButtonBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
} from '@discordjs/builders';
import {
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    TextChannel,
    TextInputStyle,
} from 'discord.js';
import { getTimeData, msToReadable } from '../../util/DeafenUtil.js';
import { isAdmin } from '../../util/AdminUtils.js';

const DYLAN = "236982767080964097";

export const data = new SlashCommandBuilder().setName('admin').setDescription('For admin functionality.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (
        !interaction.guildId ||
        !(interaction.member instanceof GuildMember) ||
        !(interaction.channel instanceof TextChannel)
    ) {
        await interaction.reply({ content: "You can't use that command here.", ephemeral: true });
        return;
    }

    if (!isAdmin(interaction.client, interaction.member.id)) {
        await interaction.reply({ content: "You don't have permission to use that command.", ephemeral: true });
        return;
    }

    const delete_message = new ButtonBuilder()
        .setCustomId('delete_message')
        .setLabel('🗑️ Delete Message')
        .setStyle(ButtonStyle.Danger);
    const kick_voice = new ButtonBuilder()
        .setCustomId('kick_from_voice')
        .setLabel('⛔ Kick from Voice')
        .setStyle(ButtonStyle.Danger);
    const change_nick = new ButtonBuilder()
        .setCustomId('change_nick')
        .setLabel('👤 Change Nickname')
        .setStyle(ButtonStyle.Primary);
    const ban_gpt = new ButtonBuilder()
        .setCustomId('ban_from_gpt')
        .setLabel('🚫 Ban from GPT')
        .setStyle(ButtonStyle.Danger);
    const pardon_gpt = new ButtonBuilder()
        .setCustomId('unban_from_gpt')
        .setLabel('✅ Pardon from GPT')
        .setStyle(ButtonStyle.Success);
    const ban_music = new ButtonBuilder()
        .setCustomId('ban_from_music')
        .setLabel('🚫 Ban from 🎵Music')
        .setStyle(ButtonStyle.Danger);
    const pardon_music = new ButtonBuilder()
        .setCustomId('unban_from_music')
        .setLabel('✅ Pardon from 🎵Music')
        .setStyle(ButtonStyle.Success);
    const ban_server_music = new ButtonBuilder()
        .setCustomId('ban_guild_from_music')
        .setLabel('🚫 Ban Guild from 🎵Music')
        .setStyle(ButtonStyle.Danger);
    const pardon_server_music = new ButtonBuilder()
        .setCustomId('unban_guild_from_music')
        .setLabel('✅ Pardon Guild from 🎵Music')
        .setStyle(ButtonStyle.Success);
    const dylan_time = new ButtonBuilder()
        .setCustomId('dylan_time')
        .setLabel('☕ Dylan Time')
        .setStyle(ButtonStyle.Primary)

    const mainMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(kick_voice, delete_message, change_nick, dylan_time);

    const mainMenu2 = new ActionRowBuilder<ButtonBuilder>().addComponents(ban_gpt, pardon_gpt);

    const mainMenu3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        ban_music,
        pardon_music,
        ban_server_music,
        pardon_server_music,
    );

    const message = await interaction.reply({
        components: [mainMenu, mainMenu2, mainMenu3],
        content: 'Admin Panel. Please select an option within 60 seconds.',
        ephemeral: true,
    });

    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

    collector.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId === 'delete_message') {
            const idInput = new TextInputBuilder()
                .setCustomId('delete_message_id_input')
                .setLabel('Message ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('delete_message_modal')
                .setTitle('Delete Message')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'kick_from_voice') {
            const idInput = new TextInputBuilder()
                .setCustomId('kick_from_voice_id_input')
                .setLabel('User ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('kick_from_voice_modal')
                .setTitle('Kick from Voice')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'change_nick') {
            const idInput = new TextInputBuilder()
                .setCustomId('change_nick_id_input')
                .setLabel('User ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(false);

            const newNickInput = new TextInputBuilder()
                .setCustomId('change_nick_new_nick_input')
                .setLabel('New Nickname')
                .setPlaceholder('New Nickname')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(32)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);
            const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(newNickInput);

            const modal = new ModalBuilder()
                .setCustomId('change_nick_modal')
                .setTitle('Change Nickname')
                .addComponents(row, row2);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'ban_from_gpt') {
            const idInput = new TextInputBuilder()
                .setCustomId('ban_from_gpt_id_input')
                .setLabel('User ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('ban_from_gpt_modal')
                .setTitle('Ban from GPT')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'unban_from_gpt') {
            const idInput = new TextInputBuilder()
                .setCustomId('unban_from_gpt_id_input')
                .setLabel('User ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('unban_from_gpt_modal')
                .setTitle('Unban from GPT')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'ban_from_music') {
            const idInput = new TextInputBuilder()
                .setCustomId('ban_from_music_id_input')
                .setLabel('User ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('ban_from_music_modal')
                .setTitle('Ban from MusicBot')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'unban_from_music') {
            const idInput = new TextInputBuilder()
                .setCustomId('unban_from_music_id_input')
                .setLabel('User ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('unban_from_music_modal')
                .setTitle('Unban from MusicBot')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'ban_guild_from_music') {
            const idInput = new TextInputBuilder()
                .setCustomId('ban_guild_from_music_id_input')
                .setLabel('Guild ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('ban_guild_from_music_modal')
                .setTitle('Ban from MusicBot')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'unban_guild_from_music') {
            const idInput = new TextInputBuilder()
                .setCustomId('unban_guild_from_music_id_input')
                .setLabel('Guild ID')
                .setPlaceholder('123456789012345678')
                .setStyle(TextInputStyle.Short)
                .setMinLength(15)
                .setMaxLength(20)
                .setRequired(true);

            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(idInput);

            const modal = new ModalBuilder()
                .setCustomId('unban_guild_from_music_modal')
                .setTitle('Unban from MusicBot')
                .addComponents(row);

            await buttonInteraction.showModal(modal);
        } else if (buttonInteraction.customId === 'dylan_time') {
            const timeData = await getTimeData(interaction.client.sql);

            if (timeData === null) {
                await buttonInteraction.update({ embeds: [], components: [], content: 'No data recorded yet.' });
                return;
            }

            let dylanTimeDeafen;
            let dylanTimeTotal;

            let avgTimeDeafen = 0;
            let avgTimeTotal = 0;

            let dylanExists = false;

            for (let user of timeData) {
                if(user.id === DYLAN) {
                    dylanTimeDeafen = user.time_deafen;
                    dylanTimeTotal = user.time_total;
                    dylanExists = true;
                } else {
                    avgTimeDeafen += user.time_deafen;
                    avgTimeTotal += user.time_total;
                }
            }


            // Subtract 1 from length to account for Dylan
            avgTimeDeafen /= timeData.length - (dylanExists ? 1 : 0);
            avgTimeTotal /= timeData.length - (dylanExists ? 1 : 0);

            const embed = new EmbedBuilder()
                .setColor(0xF5BB12)
                .setTitle('Dylan Deafen Time')
                .addFields(
                    { name: 'Time spent deafened', value: dylanTimeDeafen > 0 ? msToReadable(dylanTimeDeafen) : '0', inline: true },
                    { name: 'Total time', value: dylanTimeTotal > 0 ? msToReadable(dylanTimeTotal) : '0', inline: true },
                    { name: 'Average total time', value: avgTimeTotal !== Infinity ? msToReadable(avgTimeTotal) : 'N/A', inline: true },
                    { name: 'Average time deafened', value: avgTimeDeafen !== Infinity ? msToReadable(avgTimeDeafen) : 'N/A', inline: true },
                )
                .setTimestamp()

            if (dylanTimeTotal > 0) {
                embed.addFields(
                    { name: 'Percentage of time deafened', value: Math.floor((dylanTimeDeafen / dylanTimeTotal) * 100) + '%', inline: true }
                )
            } else {
                embed.addFields(
                    { name: 'Percentage of time deafened', value: 'N/A', inline: true }
                )
            }

            await buttonInteraction.update({ embeds: [embed], content: null, components: [] });
        }
    });
}
