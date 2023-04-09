import { Events, Message, MessageType } from 'discord.js';
import { ChatGPTChat, GPT4AllChat } from '../util/ai/LLMHelpers.js';

export const name = Events.MessageCreate;
export const once = false;
export const execute = async (msg: Message) => {
    if (!msg.guild) return;

    if (msg.author.id === msg.client.user.id) {
        return;
    }

    if (msg.content.toUpperCase().startsWith('!CHATGPT')) {
        let prompt = msg.content.substring(9).trim();

        if (prompt.length == 0) {
            return;
        }

        if (msg.type === MessageType.Reply && msg.reference?.messageId) {
            const repliedTo = await msg.channel.messages.cache.get(msg.reference.messageId);
            if (repliedTo) {
                prompt += `\nHere is the message I am referring to, you should reply to this:\n-----BEGIN MESSAGE-----\n\n${repliedTo.content}\n-----END MESSAGE-----`;
            }
        }

        const response = await msg.reply('*Thinking...*');

        const gpt = new ChatGPTChat(msg.client.openai);
        await gpt.init();

        const reply = await gpt.prompt(prompt);

        if (reply) {
            await response.edit(reply);
        } else {
            await response.edit('Sorry, I could not think of a response. Please contact the bot owner.');
        }

        await gpt.close();
    } else if (msg.content.toUpperCase().startsWith('!SCUFFGPT')) {
        let prompt = msg.content.substring(10).trim();

        if (prompt.length == 0) {
            return;
        }

        if (msg.type === MessageType.Reply && msg.reference?.messageId) {
            const repliedTo = await msg.channel.messages.cache.get(msg.reference.messageId);
            if (repliedTo) {
                prompt += `\nHere is the message I am referring to, you should reply to this:\n-----BEGIN MESSAGE-----\n\n${repliedTo.content}\n-----END MESSAGE-----`;
            }
        }

        const response = await msg.reply('*Thinking...*');

        const gpt = new GPT4AllChat();
        await gpt.init();

        const reply = await gpt.prompt(prompt);

        if (reply) {
            await response.edit(reply);
        } else {
            await response.edit('Sorry, I could not think of a response. Please contact the bot owner.');
        }

        await gpt.close();
    }
};
