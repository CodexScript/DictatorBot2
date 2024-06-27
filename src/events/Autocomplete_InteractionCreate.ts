import {AutocompleteInteraction, Events, GuildMember} from 'discord.js';

export const name = Events.InteractionCreate;
export const once = false;
export const execute = async (interaction: AutocompleteInteraction) => {
    if (!interaction.isAutocomplete()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.warn(`Command not found: ${interaction.commandName}`);
        return;
    }
    if (command[1].autocomplete) {
        await command[1].autocomplete(interaction);
    }
};
