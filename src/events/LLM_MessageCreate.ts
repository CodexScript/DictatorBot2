import { ChannelType, Events, Message, MessageType, ThreadAutoArchiveDuration, ThreadChannel } from 'discord.js';
import { ChatGPTChat, ChatGPTModel, LLMChat } from '../util/ai/LLMHelpers.js';

const chatInstances = new Map<string, LLMChat>();

export const name = Events.MessageCreate;
export const once = false;
export const execute = async (msg: Message) => {
    // Clean out old chat instances
    for (const [userId, chat] of chatInstances) {
        if (chat.channel.type === ChannelType.PrivateThread || chat.channel.type === ChannelType.PublicThread) {
            if (chat.channel instanceof ThreadChannel) {
                if (chat.channel.archived) {
                    await chat.channel.setLocked(true, 'Chat session ended.');
                }
                if (chat.channel.archived || chat.channel.locked) {
                    await chat.close();
                    chatInstances.delete(userId);
                }
            }
        }
    }

    if (msg.client.openai == null) {
        return;
    }

    if (
        (msg.channel.type !== ChannelType.PublicThread &&
            msg.channel.type !== ChannelType.PrivateThread &&
            msg.channel.type !== ChannelType.GuildText) ||
        msg.author.bot
    )
        return;

    if (!msg.content.startsWith('!')) return;

    if (msg.client.config.bannedFromGPT && msg.client.config.bannedFromGPT.includes(msg.author.id)) return;

    const command = msg.content.split(' ')[0].substring(1).toUpperCase();

    let openAi = false;

    let prompt = '';

    if (command === 'CHATGPT') {
        prompt = msg.content.substring(9).trim();
        openAi = true;
    } else if (command === 'JAILBREAK') {
        prompt = msg.content.substring(11).trim();
        openAi = true;
    } else if (command === 'GPT4') {
        prompt = msg.content.substring(6).trim();
        openAi = true;
    } else if (command === 'JAILBREAK4') {
        prompt = msg.content.substring(12).trim();
        openAi = true;
    }

    if (prompt.length == 0 && command !== 'CONTINUE') {
        return;
    }

    let gpt = chatInstances.get(msg.author.id);

    let response: Message | undefined;

    if (command !== 'CONTINUE') {
        if (msg.type === MessageType.Reply && msg.reference?.messageId) {
            const repliedTo = await msg.channel.messages.cache.get(msg.reference.messageId);
            if (repliedTo) {
                prompt += `\nHere is the message I am referring to, you should reply to this:\n-----BEGIN MESSAGE-----\n\n${repliedTo.content}\n-----END MESSAGE-----`;
            }
        }

        response = await msg.reply('*Thinking...*');
    }

    if (openAi) {
        if (!gpt || gpt.channel.id !== msg.channel.id || msg.channel.type === ChannelType.GuildText) {
            if (gpt) {
                gpt.close();
                if (gpt.channel.type === ChannelType.PrivateThread || gpt.channel.type === ChannelType.PublicThread) {
                    if (gpt.channel instanceof ThreadChannel) {
                        await gpt.channel.setLocked(true, 'Chat session ended.');
                    }
                }
            }

            const model = command === 'GPT4' || command === 'JAILBREAK4' ? ChatGPTModel.GPT4 : ChatGPTModel.CHATGPT;

            const shouldJailbreak = command === 'JAILBREAK' || command === 'JAILBREAK4';

            gpt = new ChatGPTChat(msg.channel, msg.client.openai, model, shouldJailbreak);

            chatInstances.set(msg.author.id, gpt);

            gpt.lastMsg = msg.id;

            await gpt.init();
        }

        const reply = await gpt.prompt(prompt);

        if (response) {
            if (reply) {
                await response.edit(reply.substring(0, 2000));
                if (reply.toLowerCase().startsWith("i'm sorry,")) {
                    await response.react('🤓');
                }
            } else {
                await response.edit('Sorry, I could not think of a response. Please contact the bot owner.');
            }
        }

        // await gpt.close();
    } else if (command === 'CONTINUE') {
        const gpt = chatInstances.get(msg.author.id);

        if (!gpt) {
            await msg.reply(`You have not started a chat session yet! Please start one using one of:
            \`\`\`
            !chatgpt <prompt>
            !jailbreak <prompt>
            \`\`\``);
            return;
        } else if (gpt.channel.type === ChannelType.PrivateThread || gpt.channel.type === ChannelType.PublicThread) {
            await msg.reply(
                'You already have a thread going! Continue the conversation there, or start a new one here.',
            );
            return;
        }

        let lastMsg = msg;

        if (gpt.lastMsg) {
            lastMsg = await msg.channel.messages.fetch(gpt.lastMsg);
        }

        const thread = await lastMsg.startThread({
            name: `${gpt.model}-${msg.author.username}-${msg.id}`,
            reason: 'AI Conversation',
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
        });

        gpt.channel = thread;

        await msg.channel.send('Continuing conversation in thread...');
    }
};
