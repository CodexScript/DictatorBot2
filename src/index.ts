import { ActivityType, Interaction } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Bot, { setProfilePicture } from './models/Bot.js';
import { registerCommands, registerEvents } from './util/CommandUtils.js';

function thanksgiving(year: number): Date {
    const lastOfNov = new Date(year, 10, 30).getDay();
    const turkyDay = (lastOfNov >= 4 ? 34 : 27) - lastOfNov;
    return new Date(year, 10, turkyDay);
}

async function setStatus(client: Bot) {
    const now = new Date();
    const thanksgivingDate = thanksgiving(now.getFullYear());
    if (now.getMonth() === 10 && now.getDate() === thanksgivingDate.getDate()) {
        client.user?.setActivity('Woke Up Thankful', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=XE69NQbbV8Y',
        });
    } else {
        client.user?.setActivity('PINK TAPE', {
            type: ActivityType.Streaming,
            url: 'https://www.youtube.com/watch?v=jbSQTQrYAB4',
        });
    }
}

(async () => {
    const client = new Bot();

    client.music.on('connect', () => {
        console.log('Connected to lavalink.');
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
        await client.music.connect(client.user!.id);
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

    await client.login(client.config.botToken);
})();
