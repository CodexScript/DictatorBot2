/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	GuildMember, Message,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageSelectMenu,
	MessageSelectOptionData,
	Permissions,
	TextBasedChannel,
} from 'discord.js';
import { BasedometerManager } from './BasedometerManager.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { BasedometerCategory } from '../../models/basedometer/Basedometer.js';

export class BasedometerInstance {
	lastInteraction: Date;
	channel: TextBasedChannel;
	visible: boolean;
	currentSlide: Message | undefined;
	manager: BasedometerManager;
	member: GuildMember;
	category: BasedometerCategory | undefined;
	currentEntry: number | undefined;
	userDiffs: Array<number> = [];
	finished = false;

	constructor(manager: BasedometerManager, member: GuildMember, channel: TextBasedChannel, visible: boolean) {
		this.lastInteraction = new Date();
		this.channel = channel;
		this.visible = visible;
		this.manager = manager;
		this.member = member;
	}

	async startQuiz() {
		const selectOptions: Array<MessageSelectOptionData> = [];

		for (const [, category] of this.manager.categories.entries()) {
			selectOptions.push({
				label: category.displayName,
				description: category.desc,
				value: category.directoryName,
			});
		}

		const selectRow = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('basedometerCategorySelector')
					.setPlaceholder('No category selected')
					.addOptions(selectOptions)
					.setMaxValues(1)
					.setMinValues(1),
			);

		const selectMessage = await this.channel.send({ content: 'Welcome to the Basedometer test © 2020 Aidan Walden (idea, code) & Payton Odierno (name). Please note that decimal places ARE allowed.\nPlease select a category.', components: [selectRow] });

		const filter = (i: MessageComponentInteraction) => i.customId === 'basedometerCategorySelector' && i.user.id === this.member.user.id;

		try {
			const selectInteraction = await selectMessage.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 });
			const categoryName = selectInteraction.values[0];
			const category = this.manager.categories.get(categoryName);
			if (category === undefined) {
				await selectMessage.edit({ content: 'This category is not set up properly. Please contact the bot owner.', components: [] });
				return;
			}
			await selectMessage.edit({ content: `${category.displayName} selected.`, components: [] });
			this.category = category;
			// for (const entry of category.entries) {
			this.currentEntry = -1;
			await this.nextEntry();
		}
		catch (e) {
			console.log(e);
			await selectMessage.edit({ content: 'Category not selected in time.', components: [] });
		}
	}

	async nextEntry() {
		const helpString = 'Use `/basedometer rate` in order to rate this entry on a scale from 0-10.';
		this.lastInteraction = new Date();
		if (this.currentEntry === undefined || this.category === undefined) {
			return;
		}

		this.currentEntry++;

		if (this.currentSlide !== undefined) {
			await this.currentSlide.edit({ components: [] });
		}

		const entry = this.category.entries[this.currentEntry];

		if (entry === undefined) {
			await this.finishQuiz();
			return;
		}

		const slideshowRow = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('basedometerPrevImage')
					.setStyle(MessageButtonStyles.PRIMARY)
					.setLabel('⬅️'),
				new MessageButton()
					.setCustomId('basedometerNextImage')
					.setStyle(MessageButtonStyles.PRIMARY)
					.setLabel('➡️'),
			);
		let filesIndex = 0;
		const categoryMsg = await this.channel.send({
			content: `${helpString}\n${filesIndex + 1} / ${entry.files.length}`,
			files: [`./assets/rating/${this.category!.directoryName}/media/${entry.files[filesIndex]}`],
			components: [slideshowRow],
		});

		this.currentSlide = categoryMsg;

		const slideshowCollector = categoryMsg.createMessageComponentCollector({
			componentType: 'BUTTON',
			time: 120000,
		});
		slideshowCollector.on('collect', async i => {
			if (i.user.id === this.member.user.id) {
				if (i.customId === 'basedometerPrevImage') {
					this.lastInteraction = new Date();
					filesIndex--;
					if (filesIndex < 0) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						filesIndex = entry.files.length - 1;
					}
				}
				else if (i.customId === 'basedometerNextImage') {
					this.lastInteraction = new Date();
					filesIndex++;
					if (filesIndex >= entry.files.length) {
						filesIndex = 0;
					}
				}

				// Update so that Discord doesn't freak out about request not being acknowledged
				await i.update({ files: [], components: [slideshowRow] });

				// Edit immediately after to restore files, because updating with a new file appends it instead of replacing it for some reason
				await categoryMsg.edit({ content: `${helpString}\n${filesIndex + 1} / ${entry.files.length}`, files: [`./assets/rating/${this.category!.directoryName}/media/${entry.files[filesIndex]}`], components: [slideshowRow] });
			}
			else {
				await i.reply({
					content: 'Only the person who initiated this basedometer quiz may use these buttons.',
					ephemeral: true,
				});
			}
		});
	}

	async finishQuiz(immediateDelete = false) {
		if (this.finished) {
			return;
		}

		this.finished = true;
		let average: number | undefined;

		if (this.userDiffs.length > 0) {
			average = this.userDiffs.reduce((a, b) => a + b) / this.userDiffs.length;
		}

		const components: Array<MessageActionRow> = [];

		let doneString = `The Basedometer is now finished!\nThe average difference for your ratings was: ***${average}***`;

		if (this.channel.isThread() && this.channel.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
			if (immediateDelete) {
				await this.deleteThread();
				return;
			}

			doneString += '\nThis thread will automatically be deleted in 15 minutes if you do not choose to keep it.';
			components.push(new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('basedometerKeepThread')
						.setStyle(MessageButtonStyles.SUCCESS)
						.setLabel('Keep this thread'),
				),
			);

			const threadDelete = setTimeout(async () => {
				await this.deleteThread(done);
			}, 15000 * 60);

			const done = await this.channel.send({ content: doneString, components: components });

			const keepCollector = done.createMessageComponentCollector({
				componentType: 'BUTTON',
				time: 15000 * 60,
			});

			keepCollector.on('collect', async keepInteraction => {
				if (keepInteraction.customId === 'basedometerKeepThread') {
					if (keepInteraction.user.id === this.member.user.id || keepInteraction.user.id === keepInteraction.client.config.ownerID || (keepInteraction.member instanceof GuildMember && keepInteraction.member.permissions.has(Permissions.FLAGS.MANAGE_THREADS))) {
						await keepInteraction.update({ content: 'This thread will no longer be deleted.', components: [] });
						clearTimeout(threadDelete);
					}
					else {
						await keepInteraction.reply({
							content: 'You do not have permission to use this button.',
							ephemeral: true,
						});
					}
				}
			});
		}

		this.manager.instances.delete(this.member.user.id);
	}

	private async deleteThread(done?: Message) {
		if (this.channel.isThread()) {
			if (this.channel.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_THREADS)) {
				await this.channel.delete();
			}
			else {
				await this.channel.send({ content: 'I tried to delete this thread but I do not have the proper permissions.' });
				if (done) {
					await done.edit({ components: [] });
				}
			}
		}
	}
}