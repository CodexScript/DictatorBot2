import { BaseInteraction, Events } from 'discord.js';
import { writeConfig } from '../../util/settings/GlobalSettingsManager.js';
import { isAdmin } from '../../util/AdminUtils.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'ban_guild_from_music_modal') return;

    if (!isAdmin(interaction.client, interaction.user.id)) {
        await interaction.reply({ content: 'You don\'t have permission to use that command.', ephemeral: true });
        return;
    };

    const guildId = interaction.fields.getTextInputValue('ban_guild_from_music_id_input');

    if (!guildId) {
        await interaction.reply({ content: 'Please enter a guild ID.', ephemeral: true });
        return;
    }

    if (interaction.client.config.guildsBannedFromMusic) {
        if (!interaction.client.config.guildsBannedFromMusic.includes(guildId)) {
            interaction.client.config.guildsBannedFromMusic.push(guildId);
        }
    } else {
        interaction.client.config.guildsBannedFromMusic = [guildId];
    }

    await writeConfig(interaction.client.config);

    await interaction.reply({ content: 'Guild banned from MusicBot.', ephemeral: true });
};
