import * as SocialCreditManager from './util/SocialCreditManager.js';
import { Bot } from './models/Bot.js';
import { registerCommands } from './util/CommandUtils.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

(async () => {


	const client = new Bot();

	await SocialCreditManager.establishConnection(client.config.socialCreditDatabase);

	client.music.on('connect', () => {
		console.log('Connected to lavalink.');
	});

	client.once('ready', async () => {
		const __filename = fileURLToPath(import.meta.url);
		await registerCommands(client, join(dirname(__filename), 'commands'), process.argv.includes('--force-sync'), '272896244412579841');
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		await client.music.connect(client.user!.id);
		console.log(`${client.user?.username} is now providing they/their services to the CCP.`);
	});

	client.on('interactionCreate', async interaction => {
		if (!interaction.isCommand()) {
			return;
		}

		const command = client.commands.get(interaction.commandName);

		if (!command) {
			console.log('Command not found: ' + interaction.commandName);
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

	await client.login(client.config.botToken);
})();