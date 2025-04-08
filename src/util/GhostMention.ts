import Bot from '../models/Bot.js';

export async function ghostMention(client: Bot) {
    const random = Math.floor(Math.random() * 50);
    if (random !== 0) {
        return;
    }

    const owner = await client.users.fetch(client.config.ownerID);
    const guild = await client.guilds.fetch('235141072345366539');
    const channel = await guild.channels.fetch('235141072345366539');
    if (!channel || !channel.isTextBased()) {
        await owner.send('Ghost mention channel not found.');
        return;
    }

    const message = await channel.send('<@185203003333148672>');
    const deleted = await message.delete();

    if (deleted) {
        await owner.send('Ghost mention sent.');
    } else {
        await owner.send('Ghost mention failed.');
    }
}
