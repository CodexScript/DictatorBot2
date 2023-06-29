import { Events, Message } from "discord.js";

export const name = Events.MessageDelete;
export const once = false;
export const execute = async (msg: Message) => {
    await msg.client.Bot.XKeyscore.handleMessageDelete(msg);
}