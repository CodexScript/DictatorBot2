import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import yaml from 'js-yaml'
import * as fs from 'fs';
import { Config } from './models/config/Config';

const config = yaml.load(fs.readFileSync('config.yml', 'utf8')) as Config;

const commands = [];
const commandCategories = fs.readdirSync('./').filter(file => fs.statSync(`./${file}`).isDirectory());

// Place your client and guild ids here
const clientId = config.clientID;
const guildId = null;

for (const category of commandCategories) {
	console.log(category);
	const categoryCommands = fs.readdirSync(`./${category}`).filter(file => file.endsWith('.js'));
	for (const file of categoryCommands) {
		console.log(`./${category}/${file}`);
		const command = require(`./${category}/${file}`);
		commands.push(command.data.toJSON());
	}
}


const rest = new REST({ version: '9' }).setToken(config.botToken);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

        if (guildId) {
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
        }
        else {
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
        }

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();
