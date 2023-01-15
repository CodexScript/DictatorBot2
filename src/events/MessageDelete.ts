import { Events, Message } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import fs from 'fs';

function parseJSONFromFile(filepath: string): any {
    // read the file synchronously
    const fileData = fs.readFileSync(filepath, 'utf8');
    // parse the JSON data
    return JSON.parse(fileData);
}


const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(config);
const limiter = new RateLimiterMemory({ points: 5, duration: 15 });

const users = parseJSONFromFile('./assets/users.json');

export const name = Events.MessageDelete;
export const once = false;
export const execute = async (msg: Message) => {
    if (!msg.guild) return;
    
    if (msg.guildId === msg.client.config.mainGuildID && msg.author.id !== msg.client.user.id) {
        if (msg.mentions.users.size < 0) {
            const owner = await msg.client.users.fetch(msg.client.config.ownerID);
            await owner.send(`Message deleted in ${msg.guild.name} by ${msg.author.tag}:\n${msg.content}`);    
            return;
        }

        const username = users[msg.author.id] || msg.author.username;
        const victim = msg.mentions.users.first();
        if (!victim) return;

        const victimName = users[victim.id] || victim.username;
        
        // Rate limit to 5 requests per 15 seconds. Use key "1" as a generic placeholder to limit all requests.
        try {
            await limiter.consume(1, 1);
            try {
                const completion = await openai.createCompletion({
                    model: 'text-davinci-003',
                    prompt: `You are a moderator on the messaging platform Discord. A user in your server has just mentioned ${victimName} in a message and then deleted it. Write a message telling this user that their action was inappropriate and childish. Be mean, use insults. Use more general insults towards the end. Use the vocabulary of a teenager. Use strong profanity. The users name is "${username}".`,
                    temperature: 0.7,
                    max_tokens: 150,
                });
        
                const response = completion.data.choices[0].text;
        
                if (!response) {
                    await msg.channel.send(`It was ${username}.`);
                    return;
                }
                
                await msg.channel.send(msg.author.toString() + response + '\n\n- GPT-3');
            } catch (err: any) {
                if (err.response) {
                    console.log(err.response.status);
                    console.log(err.response.data);
                } else {
                    console.log(err.message);
                }
                await msg.channel.send(`It was ${username}.`);
            }
        } catch (err) {
            await msg.channel.send(`It was ${username}.`);
            return;
        }
    }
}