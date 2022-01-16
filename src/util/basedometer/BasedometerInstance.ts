/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
	GuildMember,
	MessageActionRow,
	MessageButton,
	MessageComponentInteraction,
	MessageSelectMenu,
	MessageSelectOptionData,
	TextBasedChannel,
} from 'discord.js';
import { BasedometerManager } from './BasedometerManager.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { BasedometerCategory } from '../../models/basedometer/Basedometer.js';

export class BasedometerInstance {
	lastInteraction: Date;
	channel: TextBasedChannel;
	visible: boolean;
	lastMessageLink: string | undefined;
	manager: BasedometerManager;
	member: GuildMember;
	category: BasedometerCategory | undefined;
	currentEntry: number | undefined;
	userDiffs: Array<number> = [];

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
				description: 'A category',
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
		if (this.currentEntry === undefined || this.category === undefined) {
			return;
		}
		this.currentEntry++;


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
			content: `${filesIndex + 1} / ${entry.files.length}`,
			files: [`./assets/rating/${this.category!.directoryName}/media/${entry.files[filesIndex]}`],
			components: [slideshowRow],
		});
		const slideshowCollector = categoryMsg.createMessageComponentCollector({
			componentType: 'BUTTON',
			time: 120000,
		});
		slideshowCollector.on('collect', async i => {
			if (i.user.id === this.member.user.id) {
				if (i.customId === 'basedometerPrevImage') {
					filesIndex--;
					if (filesIndex < 0) {
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						filesIndex = entry.files.length - 1;
					}
				}
				else if (i.customId === 'basedometerNextImage') {
					filesIndex++;
					if (filesIndex >= entry.files.length) {
						filesIndex = 0;
					}
				}

				// Update so that Discord doesn't freak out about request not being acknowledged
				await i.update({ files: [], components: [slideshowRow] });

				// Edit immediately after to restore files, because updating with a new file appends it instead of replacing it for some reason
				await categoryMsg.edit({ content: `${filesIndex + 1} / ${entry.files.length}`, files: [`./assets/rating/${this.category!.directoryName}/media/${entry.files[filesIndex]}`], components: [slideshowRow] });
			}
			else {
				await i.reply({
					content: 'Only the person who initiated the basedometer quiz may use these buttons.',
					ephemeral: true,
				});
			}
		});
	}

	async finishQuiz() {
		const average = this.userDiffs.reduce((a, b) => a + b) / this.userDiffs.length;
		await this.channel.send({ content: `The Basedometer is now finished!\nThe average difference for your ratings was: ***${average}***` });

		// TODO: Check for permissions to see if we can actually do this
		if (this.channel.isThread()) {
			await this.channel.delete();
		}
	}
}