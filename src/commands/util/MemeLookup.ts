import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { playURL } from '../../util/PlayerUtils.js';


export const data = new SlashCommandBuilder()
  .setName('meme')
  .setDescription('Interface with meme database.')
  .addSubcommand(subcommand => 
    subcommand
        .setName('lookup')
        .setDescription('Search for a meme')
        .addStringOption(option => option.setName('query').setDescription('The query to search for.').setRequired(true))
        .addBooleanOption(option => option.setName('play_now').setDescription('Whether to play the meme on the bot.').setRequired(false)))
  .addSubcommand(subcommand =>
        subcommand
            .setName('insert')
            .setDescription('Add a meme to the database')
            .addStringOption(option => option.setName('name').setDescription('The name of the meme.').setRequired(true))
            .addStringOption(option => option.setName('url').setDescription('The URL of the meme.').setRequired(true)));

export async function execute(interaction: CommandInteraction): Promise<void> {
    const sql = interaction.client.sql;
    const operation = interaction.options.getSubcommand(true);

    if (operation === 'lookup') {
        const query = interaction.options.getString('query');
        let playNow = interaction.options.getBoolean('play_now');

        if (playNow == null) {
            playNow = false;
        }

        if (query === null) {
            await interaction.reply({ content: 'You must specify a query.', ephemeral: true });
            return;
        }
        const statement = sql.prepare('SELECT * FROM memes WHERE name LIKE (?)')
        const meme = statement.get(`%${query}%`);

        if (meme instanceof Error) {
            await interaction.reply({ content: 'Error searching for meme.', ephemeral: true });
            return;
        }

        if (meme === undefined) {
            await interaction.reply({ content: 'Could not find a meme with that query.', ephemeral: true });
            return;
        }

        if (playNow) {
            await playURL(interaction, new URL(meme.url));
        } else {
            await interaction.reply({ content: `**${meme.name}** - ${meme.url}` });
        }
        
    } else if (operation === 'insert') {
        const name = interaction.options.getString('name');

        if (name === null) {
            await interaction.reply({ content: 'You must specify a name.', ephemeral: true });
            return;
        }

        const url = interaction.options.getString('url');

        if (url === null) {
            await interaction.reply({ content: 'You must specify a url.', ephemeral: true });
            return;
        }

        try {
            new URL(url!);
        }
        catch {
            await interaction.reply({ content: 'Invalid URL.', ephemeral: true });
            return;
        }
        
        const statement = sql.prepare('INSERT OR IGNORE INTO memes (name, url) VALUES (?, ?)');
        const meme = statement.run(name, url);

        await interaction.reply({ content: `Meme added. Changes to database: ${meme.changes}`, ephemeral: true });
    }
}