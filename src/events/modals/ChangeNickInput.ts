import { BaseInteraction, Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: BaseInteraction) => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId !== 'change_nick_modal') return;

    if (interaction.user.id !== interaction.client.config.ownerID) return;

    let userId = interaction.fields.getTextInputValue('change_nick_id_input');
    const newNick = interaction.fields.getTextInputValue('change_nick_new_nick_input');

    if (!newNick) {
        await interaction.reply({ content: 'Please enter a new nickname.', ephemeral: true });
        return;
    }

    if (!userId) {
        userId = interaction.client.user.id;
    }

    if (!interaction.guild) {
        await interaction.reply({ content: 'Guild not found.', ephemeral: true });
        return;
    }

    const member = await interaction.guild.members.fetch(userId);

    if (!member) {
        await interaction.reply({ content: 'Member not found.', ephemeral: true });
        return;
    }

    try {
        await member.setNickname(newNick);
        await interaction.reply({ content: 'Nickname changed.', ephemeral: true });
    } catch (error) {
        await interaction.reply({
            content: 'Failed to change nickname. Possibly missing permissions.',
            ephemeral: true,
        });
    }
};
