import { BaseInteraction, Events } from 'discord.js';
import { writeConfig } from '../../util/settings/GlobalSettingsManager.js';
export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'ban_guild_from_music_modal') return;

    if (interaction.user.id !== interaction.client.config.ownerID) return;

    const guildId = interaction.fields.getTextInputValue('ban_guild_from_music_id_input');

    if (!guildId) {
        await interaction.reply({ content: 'Please enter a guild ID.', ephemeral: true });
        return;
    }

    if (interaction.client.config.bannedFromMusic) {
        if (!interaction.client.config.guildsBannedFromMusic.includes(guildId)) {
            interaction.client.config.guildsBannedFromMusic.push(guildId);
        }
    } else {
        interaction.client.config.bannedFromMusic = [guildId];
    }

    await writeConfig(interaction.client.config);

    await interaction.reply({ content: 'Guild banned from MusicBot.', ephemeral: true });
};
