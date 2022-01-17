import { SlashCommandBuilder } from '@discordjs/builders';
import {
	CommandInteraction, DMChannel, GuildMember, Interaction,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction, TextBasedChannel, TextChannel,
} from 'discord.js';
import { BasedometerInstance } from '../../util/basedometer/BasedometerInstance.js';
import { BasedometerManager } from '../../util/basedometer/BasedometerManager.js';
import { addSocialCredit } from '../../util/SocialCreditManager.js';

const manager = new BasedometerManager();

async function createNewQuiz(interaction: Interaction, useThread: boolean, visible: boolean): Promise<BasedometerInstance | null> {
	if (interaction.channel === null || !(interaction.channel instanceof TextChannel) || !(interaction.member instanceof GuildMember)) {
		return null;
	}

	let quizChannel: TextBasedChannel = interaction.channel;

	if (useThread) {
		quizChannel = await interaction.channel.threads.create({
			name: `basedometer-${interaction.user.username.toLowerCase()}-${interaction.id}`,
			autoArchiveDuration: 60,
			reason: 'Basedometer test',
		});
	}

	return new BasedometerInstance(manager, interaction.member, quizChannel, visible);
}

export const data = new SlashCommandBuilder()
	.setName('basedometer')
	.setDescription('Sends a series of pictures in order to establish someone\'s 1-10 rating scale.')
	.addSubcommand(subcommand =>
		subcommand.setName('start')
			.setDescription('Start a new test.')
			.addBooleanOption(option =>
				option.setName('use_thread')
					.setDescription('Create a separate thread to reduce spam')
					.setRequired(false))
			.addBooleanOption(option =>
				option.setName('visible')
					.setDescription('Should other users be able to see the game?')
					.setRequired(false)),
	)
	.addSubcommand(subcommand =>
		subcommand.setName('rate')
			.setDescription('Submit a rating for an entry.')
			.addNumberOption(option =>
				option.setName('rating')
					.setDescription('Your rating for these images')
					.setRequired(true)),
	);


export async function execute(interaction: CommandInteraction): Promise<void> {
	if (interaction.channel === null) {
		await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
		return;
	}

	if (interaction.options.getSubcommand() === 'start') {
		let visible = interaction.options.getBoolean('visible');
		if (visible === null) {
			visible = true;
		}

		let useThread = interaction.options.getBoolean('useThread');
		if (useThread === null) {
			useThread = true;
		}

		if (!visible) {
			useThread = false;
		}

		await interaction.deferReply({ ephemeral: true });

		if (manager.categories.size === 0) {
			await manager.populateCategories();
		}

		const existingInstance = manager.instances.get(interaction.user.id);

		if (existingInstance !== undefined) {
			// const confirmRow = new MessageActionRow()
			// 	.addComponents(
			// 		new MessageButton()
			// 			.setCustomId('destroyOldBasedometer')
			// 			.setLabel('Yes')
			// 			.setStyle(MessageButtonStyles.DANGER),
			// 	);
			let instanceLocation: string;

			if (interaction.channel instanceof TextChannel) {
				instanceLocation = `#${interaction.channel.name} in ${interaction.guild?.name ? interaction.guild.name : 'a group DM'}`;
			}
			else if (interaction.channel instanceof DMChannel) {
				instanceLocation = 'DMs';
			}
			else {
				instanceLocation = 'an unknown location';
			}

			await interaction.followUp({
				// content: `You already have an active basedometer quiz in ${instanceLocation}! Starting a new one would destroy the old one. Are you sure?`,
				content: `You already have an active basedometer test in ${instanceLocation}!`,
			});

			return;

			// // Wait for user to respond to confirmation
			// const filter = (i: MessageComponentInteraction) => i.customId === 'destroyOldBasedometer' && i.user === interaction.user;
			//
			// const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
			// collector.on('collect', async () => {
			// 	collector.stop();
			// 	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			// 	const instance = await createNewQuiz(interaction, useThread!, visible!);
			// 	if (instance !== null) {
			// 		manager.instances.set(interaction.user.id, instance);
			// 		await interaction.editReply({ content: 'New quiz started.', components: [] });
			// 		await instance.startQuiz();
			// 	}
			// 	else {
			// 		await interaction.editReply({ content: 'Cannot start a quiz in this channel.', components: [] });
			// 	}
			// });
		}
		else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const instance = await createNewQuiz(interaction, useThread!, visible!);
			if (instance !== null) {
				manager.instances.set(interaction.user.id, instance);
				await interaction.editReply({ content: 'New test started.' });
				await instance.startQuiz();
			}
			else {
				await interaction.editReply({ content: 'Cannot start a test in this channel.' });
			}
		}
	}
	else if (interaction.options.getSubcommand() === 'rate') {
		const rating = interaction.options.getNumber('rating');
		if (rating === null) {
			await interaction.reply({ content: 'You must specify a rating.', ephemeral: true });
			return;
		}

		if (rating < 0 || rating > 10) {
			await interaction.reply({ content: 'Rating must be between 0 and 10. -10 social credit.', ephemeral: true });
			await addSocialCredit(interaction.user.id, -10);
			return;
		}

		const instance = manager.instances.get(interaction.user.id);
		if (instance === undefined) {
			await interaction.reply({ content: 'You must have an active test in order to use that command. -10 social credit.', ephemeral: true });
			await addSocialCredit(interaction.user.id, -10);
			return;
		}

		if (interaction.channel !== instance.channel) {
			await interaction.reply({ content: 'This is the wrong channel. -10 social credit.', ephemeral: true });
			await addSocialCredit(interaction.user.id, -10);
			return;
		}

		if (instance.currentEntry === undefined) {
			await interaction.reply({ content: 'Please select a category first.', ephemeral: true });
			return;
		}

		const entry = instance.category?.entries[instance.currentEntry];

		if (entry === undefined) {
			await interaction.reply({ content: 'Please select a category first.', ephemeral: true });
			return;
		}

		const diff = Math.round(Math.abs(entry.baseRating - rating) * 10) / 10;

		await interaction.reply({ content: `You rated ${entry.name}: ***${rating}***\nThe CCP-approved rating for ${entry.name}: *${entry.baseRating}*\nDifference: *${diff}*`, ephemeral: !instance.visible });

		instance.userDiffs.push(diff);
		await instance.nextEntry();
	}
}