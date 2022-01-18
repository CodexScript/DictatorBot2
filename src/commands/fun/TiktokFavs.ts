import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { addSocialCredit } from '../../util/SocialCreditManager.js';
import { TiktokManager } from '../../util/TiktokManager.js';
import got from 'got';
import { EventEmitter } from 'events';

let manager: TiktokManager | undefined;
const bus = new EventEmitter();

export const data = new SlashCommandBuilder()
	.setName('tiktokfavs')
	.setDescription('Grabs a random CCP-approved TikTok video.')
	.addIntegerOption(option =>
		option.setName('index')
			.setDescription('Array index.')
			.setRequired(false));

export async function execute(interaction: CommandInteraction): Promise<void> {
	const index = interaction.options.getInteger('index');

	await interaction.deferReply();

	if (!manager) {
		manager = new TiktokManager(interaction.client.config.tiktok);
	}

	if (manager.videos.length === 0 || new Date().getTime() - manager.lastFetch.getTime() > 21600000) {
		await manager.populateFavs(interaction, bus);
	}

	if (manager.isFetching) {
		await new Promise(resolve => bus.once('unlocked', resolve));
	}

	let url = undefined;

	while (url === undefined) {
		const fav = manager.videos[Math.floor(Math.random() * manager.videos.length)];
		console.log(manager.videos.length);
		if (fav.play_addr && fav.play_addr.url_list) {
			url = fav.play_addr.url_list[fav.play_addr.url_list.length - 1];
		}
	}

	const buffer = await got.get(url).buffer();

	await interaction.followUp({ files: [{ name: 'tiktok.mp4', attachment: buffer }] });

	await addSocialCredit(interaction.user.id, 10);
}