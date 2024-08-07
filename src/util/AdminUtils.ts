import { MessageCreateOptions } from "discord.js";
import Bot from "../models/Bot.js";

export async function messageOwner(client: Bot, options: MessageCreateOptions): Promise<boolean> {
    const owner = await client.users.fetch(client.config.ownerID);


    if (!owner) {
        return false;
    }

    const dm = await owner.createDM();

    if (!dm) {
        return false;
    }

    await dm.send(options);
    return true;
}