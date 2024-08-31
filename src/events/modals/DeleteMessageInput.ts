import { BaseInteraction, Events } from 'discord.js';
import { isAdmin } from '../../util/AdminUtils.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'delete_message_modal') return;

    if (!isAdmin(interaction.client, interaction.user.id)) {
        await interaction.reply({ content: 'You don\'t have permission to use that command.', ephemeral: true });
        return;
    };

    const messageId = interaction.fields.getTextInputValue('delete_message_id_input');

    if (!messageId) {
        await interaction.reply({ content: 'Please enter a message ID.', ephemeral: true });
        return;
    }

    const message = await interaction.channel?.messages.fetch(messageId);

    if (!message) {
        await interaction.reply({
            content: "Message not found. Make sure you're in the same channel, and try again.",
            ephemeral: true,
        });
        return;
    }

    try {
        await message.delete();

        await interaction.reply({ content: 'Message deleted.', ephemeral: true });
    } catch (error) {
        await interaction.reply({
            content: 'Failed to delete message. Possibly missing permissions.',
            ephemeral: true,
        });
    }
};
