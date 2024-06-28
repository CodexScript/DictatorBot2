import { SlashCommandBuilder } from '@discordjs/builders';
import { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { promises as fs } from 'fs';

let lastFetched = new Date(Date.now());
let roleData: any = null;

async function readJSON(forceRead: boolean = false): Promise<any> {
    if (roleData === null || forceRead || lastFetched < (new Date(Date.now() - 5 * 60 * 1000))) {
        lastFetched = new Date(Date.now());
        try {
            await fs.access('./assets/roles.json');
            const data = await fs.readFile('./assets/roles.json', 'utf8');
            roleData = JSON.parse(data);
            return roleData;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                roleData = {};
                return roleData;
            }
            throw error;
        }
    } else {
        return roleData;
    }
}

async function writeJSON(data: any): Promise<void> {
    await fs.writeFile('./assets/roles.json', JSON.stringify(data, null, 2), 'utf8');
    roleData = data;
    lastFetched = new Date(Date.now());
}

export const data = new SlashCommandBuilder()
    .setName('customrole')
    .setDescription('Custom roles, for when the server admin(s) are inactive.')
    .setDMPermission(false)
    .addSubcommand(subcommand =>
    subcommand
        .setName('create')
        .setDescription('Create a new role')
        .addStringOption(option => option.setName('name').setDescription('The name of the role.').setRequired(true))
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('add')
        .setDescription('Add a user to a role.')
        .addUserOption(option => option.setName('user').setDescription('The user to add to the role.').setRequired(true))
        .addStringOption(option => option.setName('role').setDescription('The role to add the user to').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('remove')
        .setDescription('Remove a user from the role.')
        .addUserOption(option => option.setName('user').setDescription('The user to remove from the role.').setRequired(true))
        .addStringOption(option => option.setName('role').setDescription('The role to remove the user from.').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('list')
        .setDescription('List the roles for this server.')
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('mention')
        .setDescription('Mentions the provided role.')
        .addStringOption(option => option.setName('role').setDescription('The role to mention.').setRequired(true).setAutocomplete(true))
    )
    .addSubcommand(subcommand =>
    subcommand
        .setName('delete')
        .setDescription('Delete a role.')
        .addStringOption(option => option.setName('name').setDescription('The name of the role to delete.').setRequired(true).setAutocomplete(true))
    )

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId;

    if (!interaction.guild || guildId === null) {
        await interaction.reply({content: "You can't use that command here.", ephemeral: true});
        return;
    }

    if (interaction.options.getSubcommand() === 'create') {
        const name = interaction.options.getString('name');
        if (name === null) {
            await interaction.reply({content: 'You must specify a group name.', ephemeral: true});
            return;
        }

        const data = await readJSON(true);

        if (Object.hasOwn(data, guildId)) {
            if (Object.hasOwn(data[guildId], name)) {
                await interaction.reply({content: 'A role with that name already exists.', ephemeral: true});
                return;
            } else {
                data[guildId][name] = [];
                await writeJSON(data);
                await interaction.reply({content: `Role \`${name}\` has been created.`});
                return;
            }
        } else {
            data[guildId] = {};
            data[guildId][name] = [];
            await writeJSON(data);
            await interaction.reply({content: `Role \`${name}\` has been created.`});
            return;
        }
    } else if (interaction.options.getSubcommand() === 'list') {
        const data = await readJSON(true);

        if (!Object.hasOwn(data, guildId) || Object.keys(data[guildId]).length === 0) {
            await interaction.reply({content: 'There are no roles currently defined for this server.', ephemeral: true});
            return;
        }

        await interaction.deferReply({ephemeral: true});

        let replyString = 'Custom roles for this server:\n```\n';
        for (let role of Object.keys(data[guildId])) {
            replyString += `${role}\n`;
            for (let user of data[guildId][role]) {
                const guildMember = await interaction.guild.members.fetch(user);
                replyString += `\t${guildMember.displayName}\n`;
            }
        }
        replyString += '```';
        await interaction.followUp({content: replyString, ephemeral: true});
    } else if (interaction.options.getSubcommand() === 'add') {
        const user = interaction.options.getUser('user');
        if (user === null) {
            await interaction.reply({content: 'You must specify a user.', ephemeral: true});
            return;
        }
        const role = interaction.options.getString('role');
        if (role === null) {
            await interaction.reply({content: 'You must specify a role.', ephemeral: true});
            return;
        }

        const data = await readJSON(true);
        if (!Object.hasOwn(data, guildId) || !Object.hasOwn(data[guildId], role)) {
            await interaction.reply({content: `Role \`${role}\` does not exist. Please create it first.`, ephemeral: true});
            return;
        }

        data[guildId][role].push(user.id);
        await writeJSON(data);
        await interaction.reply({content: `User ${user.displayName} has been added to role \`${role}\`.`, ephemeral: true});
    } else if (interaction.options.getSubcommand() === 'remove') {
        const user = interaction.options.getUser('user');
        if (user === null) {
            await interaction.reply({content: 'You must specify a user.', ephemeral: true});
            return;
        }
        const role = interaction.options.getString('role');
        if (role === null) {
            await interaction.reply({content: 'You must specify a role.', ephemeral: true});
            return;
        }

        const data = await readJSON(true);
        if (!Object.hasOwn(data, guildId) || !Object.hasOwn(data[guildId], role)) {
            await interaction.reply({content: `Role \`${role}\` does not exist. Please create it first.`, ephemeral: true});
            return;
        }

        data[guildId][role] = data[guildId][role].filter((userId: string) => userId !== user.id);
        await writeJSON(data);
        await interaction.reply({content: `User ${user.displayName} has been removed from role \`${role}\`.`, ephemeral: true});
    } else if (interaction.options.getSubcommand() === 'mention') {
        const role = interaction.options.getString('role');

        if (role === null) {
            await interaction.reply({content: 'You must specify a role.', ephemeral: true});
            return;
        }

        const data = await readJSON();
        if (!Object.hasOwn(data, guildId) || !Object.hasOwn(data[guildId], role)) {
            await interaction.reply({content: `Role \`${role}\` does not exist. Please create it first.`, ephemeral: true});
            return;
        }

        if (Object.keys(data[guildId][role]).length === 0) {
            await interaction.reply({content: 'There are no users in that role.', ephemeral: true});
            return;
        }

        let mentionString = '';
        for (let userId of Object.values(data[guildId][role])) {
            mentionString += `<@${userId}> `;
        }

        await interaction.reply({content: mentionString});
    } else if (interaction.options.getSubcommand() === 'delete') {
        const name = interaction.options.getString('name');
        if (name === null) {
            await interaction.reply({content: 'You must specify a group name.', ephemeral: true});
            return;
        }

        const data = await readJSON(true);

        if (!Object.hasOwn(data, guildId) || !Object.hasOwn(data[guildId], name)) {
            await interaction.reply({content: 'That role does not exist.', ephemeral: true});
            return;
        }
        delete data[guildId][name];
        await writeJSON(data);
        await interaction.reply({content: `Role \`${name}\` has been deleted.`});
    }
}

export async function autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const focusedValue = interaction.options.getFocused();
    const guildId = interaction.guildId;
    if (guildId === null) {
        await interaction.respond([]);
        return;
    }

    const data = await readJSON();

    if (data === null) {
        await interaction.respond([]);
        return;
    }

    if (data[guildId] === undefined) {
        await interaction.respond([]);
        return;
    }

    const choices = Object.keys(data[guildId]);
    const filtered = choices.filter(choice => choice.startsWith(focusedValue));
    await interaction.respond(
        filtered.map(choice => ({name: choice, value: choice })),
    );
}