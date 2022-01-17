import { Bot } from '../models/Bot';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import { Routes } from 'discord-api-types/v9';
import { REST } from '@discordjs/rest';

export async function registerCommands(client: Bot, dir: string, sync = false, guildId?: string): Promise<void> {
	const commandCategories = (await (fs.readdir(dir))).filter(file => {
		return fsSync.statSync(`${dir}/${file}`).isDirectory();
	});

	for (const category of commandCategories) {
		console.log('Loading commands from category: ' + category);
		const categoryCommands = (await fs.readdir(`${dir}/${category}`)).filter(file => file.endsWith('.js'));

		for (const file of categoryCommands) {
			const command = await import(`file:///${dir}/${category}/${file}`);
			console.log('Adding command to client: ' + command.data.name);
			client.commands.set(command.data.name, command);
		}
	}

	if (sync) {
		const rest = new REST({ version: '9' }).setToken(client.config.botToken);
		const commands = [];
		for (const command of client.commands) {
			commands.push(command[1].data.toJSON());
		}
		if (client.application) {
			console.log('Pushing commands to application endpoint...');
			if (guildId) {
				await rest.put(
					Routes.applicationGuildCommands(client.application.id, guildId),
					{ body: commands },
				);
			}
			else {
				await rest.put(
					Routes.applicationCommands(client.application.id),
					{ body: commands },
				);
			}
		}
		else {
			console.log('No application found, skipping hard command registration.');
		}
	}
	console.log();
}