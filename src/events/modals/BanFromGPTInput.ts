import { BaseInteraction, Events } from 'discord.js';
import { writeConfig } from '../../util/settings/GlobalSettingsManager.js';
export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'ban_from_gpt_modal') return;

    if (interaction.user.id !== interaction.client.config.ownerID) return;

    const userId = interaction.fields.getTextInputValue('ban_from_gpt_id_input');

    if (!userId) {
        await interaction.reply({ content: 'Please enter a user ID.', ephemeral: true });
        return;
    }

    if (interaction.client.config.bannedFromGPT && !interaction.client.config.bannedFromGPT.includes(userId)) {
        interaction.client.config.bannedFromGPT.push(userId);
    } else {
        interaction.client.config.bannedFromGPT = [userId];
    }

    await writeConfig(interaction.client.config);

    await interaction.reply({ content: 'User banned from GPT.', ephemeral: true });
};
