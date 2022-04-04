import { Interaction } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Bot from './models/Bot.js';
import { registerCommands, registerEvents } from './util/CommandUtils.js';
import { getCurrentPfp, setPfp } from './util/settings/GlobalSettingsManager.js';

async function setProfilePicture(client: Bot) {
  if (!client.redisConnected) {
    await client.connectRedis();
  }

  const pfp = await getCurrentPfp(client.redisClient);

  let newPfp;
  const now = new Date();

  if (now.getMonth() === 11) {
    // December
    newPfp = './assets/pfp/uzi-christmas.jpg';
  } else if (now.getMonth() === 3 && now.getDate() === 1) {
    // April Fools
    newPfp = './assets/pfp/carti.png';
  } else if (now.getMonth() === 3 && now.getDate() === 20) {
    // 420
    newPfp = './assets/pfp/uzi-smacked.jpg';
  } else if (now.getMonth() === 2 && now.getDate() === 13) {
    // Daylight savings begins
    newPfp = './assets/pfp/uzi-tart.png';
  } else if (now.getMonth() === 10 && now.getFullYear() % 4 === 0) {
    // November of election year
    newPfp = './assets/pfp/uzi-president.jpg';
  } else {
    newPfp = './assets/pfp/uzi-donda.jpg';
  }

  if (pfp !== newPfp) {
    console.log('Changing PFP...');
    await client.user?.setAvatar(newPfp);
    await setPfp(client.redisClient, newPfp);
  }
}

(async () => {
  const client = new Bot();

  await client.connectRedis();

  client.music.on('connect', () => {
    console.log('Connected to lavalink.');
  });

  client.once('ready', async () => {
    const filename = fileURLToPath(import.meta.url);
    await registerCommands(client, path.join(path.dirname(filename), 'commands'), process.argv.includes('--force-sync'), process.argv.includes('--remove'), '272896244412579841');
    await registerEvents(client, path.join(path.dirname(filename), 'events'));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await client.music.connect(client.user!.id);
    await setProfilePicture(client);

    setInterval(async () => {
      await setProfilePicture(client);
    }, 1800000);

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

    await command.execute(interaction);
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
