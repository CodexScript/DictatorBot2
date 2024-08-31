import { BaseInteraction, Events } from 'discord.js';
import { writeConfig } from '../../util/settings/GlobalSettingsManager.js';
import { isAdmin } from '../../util/AdminUtils.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'unban_guild_from_music_modal') return;

    if (!isAdmin(interaction.client, interaction.user.id)) {
        await interaction.reply({ content: 'You don\'t have permission to use that command.', ephemeral: true });
        return;
    };

    const guildId = interaction.fields.getTextInputValue('unban_guild_from_music_id_input');

    if (!guildId) {
        await interaction.reply({ content: 'Please enter a guild ID.', ephemeral: true });
        return;
    }

    interaction.client.config.guildsBannedFromMusic = interaction.client.config.guildsBannedFromMusic.filter(
        (item) => item !== guildId,
    );

    await writeConfig(interaction.client.config);

    await interaction.reply({ content: 'Guild pardoned from MusicBot.', ephemeral: true });
};
