import { BaseInteraction, Events } from 'discord.js';
import { writeConfig } from '../../util/settings/GlobalSettingsManager.js';
import { isAdmin } from '../../util/AdminUtils.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'unban_from_gpt_modal') return;

    if (!isAdmin(interaction.client, interaction.user.id)) {
        await interaction.reply({ content: 'You don\'t have permission to use that command.', ephemeral: true });
        return;
    };

    const userId = interaction.fields.getTextInputValue('unban_from_gpt_id_input');

    if (!userId) {
        await interaction.reply({ content: 'Please enter a user ID.', ephemeral: true });
        return;
    }

    interaction.client.config.bannedFromGPT = interaction.client.config.bannedFromGPT.filter((item) => item !== userId);

    await writeConfig(interaction.client.config);

    await interaction.reply({ content: 'User pardoned from GPT.', ephemeral: true });
};
