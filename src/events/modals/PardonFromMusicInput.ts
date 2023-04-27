import { BaseInteraction, Events } from 'discord.js';
import { writeConfig } from '../../util/settings/GlobalSettingsManager.js';
export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'unban_from_music_modal') return;

    if (interaction.user.id !== interaction.client.config.ownerID) return;

    const userId = interaction.fields.getTextInputValue('unban_from_music_id_input');

    if (!userId) {
        await interaction.reply({ content: 'Please enter a user ID.', ephemeral: true });
        return;
    }

    interaction.client.config.bannedFromMusic = interaction.client.config.bannedFromMusic.filter(
        (item) => item !== userId,
    );

    await writeConfig(interaction.client.config);

    await interaction.reply({ content: 'User pardoned from MusicBot.', ephemeral: true });
};
