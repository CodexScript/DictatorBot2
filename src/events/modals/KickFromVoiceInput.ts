import { BaseInteraction, Events } from 'discord.js';
import { isAdmin } from '../../util/AdminUtils.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'kick_from_voice_modal') return;

    if (!isAdmin(interaction.client, interaction.user.id)) {
        await interaction.reply({ content: 'You don\'t have permission to use that command.', ephemeral: true });
        return;
    };

    const userId = interaction.fields.getTextInputValue('kick_from_voice_id_input');

    if (!userId) {
        await interaction.reply({ content: 'Please enter a user ID.', ephemeral: true });
        return;
    }

    if (!interaction.guild) {
        await interaction.reply({ content: 'Could not find guild.', ephemeral: true });
        return;
    }

    const member = await interaction.guild.members.fetch(userId);
    try {
        await member.voice.disconnect();
    } catch (error) {
        await interaction.reply({
            content: 'Failed to kick user from voice. Possibly missing permissions',
            ephemeral: true,
        });
        return;
    }

    await interaction.reply({ content: 'Kicked from voice.', ephemeral: true });
};
