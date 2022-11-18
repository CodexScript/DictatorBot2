import { Guild, Interaction } from 'discord.js';
import { ActivityTypes } from 'discord.js/typings/enums';
import path from 'path';
import { fileURLToPath } from 'url';
import Bot from './models/Bot.js';
import { registerCommands, registerEvents } from './util/CommandUtils.js';
import { getCurrentPfp, setPfp } from './util/settings/GlobalSettingsManager.js';

async function setProfilePicture(client: Bot) {

  if (client.config.pfp.forced) {
    return;
  }
  const pfp = await getCurrentPfp(client.config);

  let newPfp;
  const now = new Date();
  if (now.getMonth() === 3 && now.getDate() === 15) {
    newPfp = './assets/pfp/uzi-vstheworld.png';
  } else if (now.getMonth() === 2 && now.getDate() === 13) {
    newPfp = './assets/pfp/uzi-vstheworld2.jpg';
  } else if (now.getMonth() === 2 && now.getDate() === 6) {
    newPfp = './assets/pfp/uzi-eternalatake.jpg';
  } else if (now.getMonth() === 7 && now.getDate() === 25) {
    newPfp = './assets/pfp/uzi-luvisrage2.jpg';
  } else if (now.getMonth() === 6 && now.getDate() === 31) {
    newPfp = './assets/pfp/uzi-luvtape.png';
  } else if (now.getMonth() === 9 && now.getDate() === 30) {
    newPfp = './assets/pfp/uzi-luvisrage.jpg';
  } else if (now.getMonth() === 11) {
    // December
    newPfp = './assets/pfp/uzi-christmas.jpg';
  } else if (now.getMonth() === 6 || (now.getMonth() === 10 && now.getFullYear() % 4 === 0)) {
    // November of election year or July
    newPfp = './assets/pfp/uzi-president.jpg';
  } else if (now.getMonth() === 9) {
    // October
    newPfp = './assets/pfp/uzi-halloween.png';
  } else if (now.getMonth() === 3 && now.getDate() === 1) {
    // April Fools
    newPfp = './assets/pfp/carti.png';
  } else if (now.getMonth() === 3 && now.getDate() === 20) {
    // 420
    newPfp = './assets/pfp/uzi-smacked.jpg';
  } else if (now.getMonth() === 2 && now.getDate() >= 13) {
    // Daylight savings begins
    newPfp = './assets/pfp/uzi-tart.png';
  } else {
    newPfp = './assets/pfp/uzi-donda.jpg';
  }

  if (pfp !== newPfp) {
    console.log('Changing PFP...');
    await client.user?.setAvatar(newPfp);
    await setPfp(client, newPfp);
  }
}

(async () => {
  const client = new Bot();

  client.music.on('connect', () => {
    console.log('Connected to lavalink.');
  });

  client.once('ready', async () => {
    const filename = fileURLToPath(import.meta.url);
    await registerCommands(client, path.join(path.dirname(filename), 'commands'), client.config.adminGuildID, process.argv.includes('--force-sync'), process.argv.includes('--remove'), '272896244412579841');
    await registerEvents(client, path.join(path.dirname(filename), 'events'));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await client.music.connect(client.user!.id);
    await setProfilePicture(client);

    await client.user?.setActivity({ name: 'RED & WHITE 🔴⚪️', type: ActivityTypes.LISTENING });

    setInterval(async () => {
      await setProfilePicture(client);
    }, 900000);

    await (await client.guilds.fetch('575404293935595531')).members.fetch();

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
