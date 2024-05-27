import { Interaction } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Bot, { setProfilePicture, setStatus } from './models/Bot.js';
import { registerCommands, registerEvents } from './util/CommandUtils.js';
import { createServer } from './server/APIServer.js';

(async () => {
    const client = new Bot();

    client.music.on('nodeConnect', () => {
        console.log('Connected to lavalink.');
    });

    client.music.on('nodeError', (node, error) => {
        console.error(`Node Error: ${error}`);
    });

    client.once('ready', async () => {
        const filename = fileURLToPath(import.meta.url);
        await registerCommands(
            client,
            path.join(path.dirname(filename), 'commands'),
            client.config.adminGuildID,
            process.argv.includes('--force-sync'),
            process.argv.includes('--remove'),
        );
        await registerEvents(client, path.join(path.dirname(filename), 'events'));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        client.music.init(client.user!.id);
        await setProfilePicture(client);

        setInterval(async () => {
            await setStatus(client);
        }, 900000);

        setInterval(async () => {
            await setProfilePicture(client);
        }, 900000);

        // await (await client.guilds.fetch('575404293935595531')).members.fetch();

        console.log(`${client.user?.username} is now providing they/their services to the CCP.`);
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isCommand()) {
            return;
        }

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.log(`Command not found: ${interaction.commandName}`);
            return;
        }

        await command[1].execute(interaction);
        // try {
        //     await command.execute(interaction);
        // }
        // catch (error: any) {
        //     console.error(error);
        //     if (interaction.replied) {
        //         await interaction.editReply({content: 'There was an error while executing this
        //         command! Please show this to the bot owner:\n```' + error.stack + '\n```'});
        //     }
        //     else {
        //         await interaction.reply({ content: 'There was an error while executing this command!
        //         Please show this to the bot owner:\n```' + error.stack + '\n```', ephemeral: true });
        //     }
        // }
    });

    await Promise.all([client.login(client.config.botToken), createServer(client)]);
})();
