import {
    ActionRowBuilder,
    ButtonBuilder,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder,
} from '@discordjs/builders';
import {
    ButtonStyle,
    CacheType,
    ChatInputCommandInteraction,
    ComponentType,
    GuildMember,
    MessageComponentInteraction,
    TextChannel,
    TextInputStyle,
    UserSelectMenuInteraction,
} from 'discord.js';

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

    if (interaction.member.id !== interaction.client.config.ownerID) {
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
    const ban_gpt = new ButtonBuilder()
        .setCustomId('ban_from_gpt')
        .setLabel('🚫 Ban from GPT')
        .setStyle(ButtonStyle.Danger);
    const pardon_gpt = new ButtonBuilder()
        .setCustomId('unban_from_gpt')
        .setLabel('✅ Pardon from GPT')
        .setStyle(ButtonStyle.Success);

    const mainMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(
        kick_voice,
        delete_message,
        ban_gpt,
        pardon_gpt,
    );

    const message = await interaction.reply({ components: [mainMenu], content: 'Admin Panel', ephemeral: true });

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
            const userSelect = new UserSelectMenuBuilder({
                custom_id: 'kick_from_voice_user_select',
                placeholder: 'Select a user',
                min_values: 1,
            });

            const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(userSelect);

            const response = await buttonInteraction.reply({
                content: 'Select user(s) to kick from voice.',
                components: [row],
                ephemeral: true,
            });

            const filter = (i: MessageComponentInteraction) =>
                i.customId === 'kick_from_voice_user_select' && i.user.id === interaction.user.id;
            try {
                const collected = await response.awaitMessageComponent({ filter, time: 60000 });
                if (
                    collected instanceof UserSelectMenuInteraction<CacheType> ||
                    collected instanceof UserSelectMenuInteraction
                ) {
                    const selectedUsers = collected.values;

                    if (!interaction.guild) {
                        await interaction.reply({ content: 'Guild not found.', ephemeral: true });
                        return;
                    }

                    let failedOnOne = false;

                    for (const user of selectedUsers) {
                        const member = await interaction.guild.members.fetch(user);
                        try {
                            await member.voice.disconnect();
                        } catch (error) {
                            failedOnOne = true;
                        }
                    }

                    if (failedOnOne) {
                        await response.edit({
                            content: 'Failed to kick one or more users from voice.',
                            components: [],
                        });
                    } else {
                        await response.edit({ content: 'Kicked user(s) from voice.', components: [] });
                    }
                }
            } catch (error) {
                await response.edit({ content: 'Timed out.', components: [] });
            }
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
        }
    });
}
