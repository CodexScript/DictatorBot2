import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ApplicationCommand } from 'discord.js';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import { Bot } from '../models/Bot';

export async function registerCommands(client: Bot, dir: string, sync = false, remove = false, guildId?: string): Promise<void> {
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

	const rest = new REST({ version: '9' }).setToken(client.config.botToken);

	if (remove) {
		const commands = await rest.get(Routes.applicationCommands(client.application!.id)) as Array<ApplicationCommand>;
		for (const command of commands) {
			console.log(`Now deleting ${command.name}`);
			await rest.delete(
				Routes.applicationCommand(client.application!.id, command.id),
			);
		}
	}

	if (sync) {
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

export async function registerEvents(client: Bot, dir: string): Promise<void> {
	const events = (await fs.readdir(dir)).filter(file => file.endsWith('.js'));
	for (const file of events) {
		const event = await import(`file:///${dir}/${file}`);
		console.log('Registering event: ' + event.name);
		if (event.once) {
			client.once(event.name, async (...args) => await event.execute(...args));
		}
		else {
			client.on(event.name, async (...args) => await event.execute(...args));
		}
	}
}