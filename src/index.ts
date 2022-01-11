import { Client, Collection, Intents } from 'discord.js';
import { config } from './util/ConfigManager.js';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { SocialCreditManager } from './util/SocialCreditManager.js';

export let commands = new Collection<string, any>();

(async () => {
    
    const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

    await SocialCreditManager.establishConnection(config.socialCreditDatabase);

    const commandCategories = (fsSync.readdirSync('./commands')).filter(file => {
        return fsSync.statSync(`./commands/${file}`).isDirectory();
    });

    for (const category of commandCategories) {
        console.log("Loading commands from category: " + category);
        const categoryCommands = (await fs.readdir(`./commands/${category}`)).filter(file => file.endsWith('.js'));
        for (const file of categoryCommands) {
            const command = await import(`./commands/${category}/${file}`);
            console.log("Adding command: " + command.data.name);
            commands.set(command.data.name, command);
        }
    }

    client.once('ready', () => {
        console.log(`${client.user?.username} is now providing they/their services to the CCP.`);
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) {
            return;
        }

        const command = commands.get(interaction.commandName);

        if (!command) {
            console.log("Command not found: " + interaction.commandName);
            return;
        }

        await command.execute(interaction);
        // try {
        //     await command.execute(interaction);
        // }
        // catch (error: any) {
        //     console.error(error);
        //     if (interaction.replied) {
        //         await interaction.editReply({content: 'There was an error while executing this command! Please show this to the bot owner:\n```' + error.stack + '\n```'});
        //     }
        //     else {
        //         await interaction.reply({ content: 'There was an error while executing this command! Please show this to the bot owner:\n```' + error.stack + '\n```', ephemeral: true });
        //     }
        // }
    });

    client.login(config.botToken);

    

})();