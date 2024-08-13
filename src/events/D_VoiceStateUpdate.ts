import { Events, VoiceState } from 'discord.js';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import fs from 'node:fs';
import Bot from '../models/Bot.js';
import { messageOwner } from '../util/AdminUtils.js';
import { readJSONSync } from '../util/DeafenUtil.js';

let joinDate: number | null = null;
let deafTime: number | null = null;
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
const DYLAN = "236982767080964097";

let json = readJSONSync();

async function writeJSON(client: Bot) {
    if (!json) {
        return;
    }
    await fs.writeFile('./assets/dylan.json', JSON.stringify(json, null, 2), 'utf8', async (err) => {
        if (!err) {
            return;
        }

        console.warn("Error writing deafen times to file: " + err);
        await messageOwner(client, { content: 'Error writing deafen times to file:\n```\n' + err + '\n```'});
    });
}

export const name = Events.VoiceStateUpdate;
export const once = false;
export const execute = async (oldState: VoiceState, newState: VoiceState) => {
    if (!oldState.member || oldState.member.id !== DYLAN || !newState.member || newState.member.id !== DYLAN) {
        return;
    }

    if (deafTime && newState.selfDeaf === false) {
        const diff = Date.now() - deafTime;
        deafTime = null;
        json.totalDeafenTime += diff;
        await writeJSON(newState.client);
    }

    // Joined channel, previously was not in the server
    if ((!oldState.channel && newState.channel) || (newState.channel && oldState.guild.id !== newState.guild.id)) {
        joinDate = Date.now();
    }

    if (newState.channel && newState.guild.id === oldState.guild.id && oldState.selfDeaf === false && newState.selfDeaf && newState.channel) {
        if (!joinDate) return;
        deafTime = Date.now();
        await messageOwner(newState.client, { content: `Dylan just deafened, he joined **${timeAgo.format(joinDate)}**`});
        
    }

    if (!newState.channel || (newState.channel && newState.guild.id !== oldState.guild.id) || newState.member.presence?.status === 'idle') {
        if (!joinDate) {
            console.warn("Left with no join date");
            await messageOwner(newState.client, {content: "Left with no join date"});
            return;
        }
        const diff = Date.now() - joinDate!;
        json.totalTime += diff;
        
        if (deafTime) {
            const deafDiff = Date.now() - deafTime;
            deafTime = null;
            json.totalDeafenTime += deafDiff;
        }
        
        await writeJSON(newState.client);
        await messageOwner(newState.client, { content: `Dylan just left, he joined **${timeAgo.format(joinDate)}**`});
        
        joinDate = null;
    }
    
};