import { Events, VoiceState } from 'discord.js';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

let joinDate: number | null = null;
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

export const name = Events.VoiceStateUpdate;
export const once = false;
export const execute = async (oldState: VoiceState, newState: VoiceState) => {
    if (!oldState.member || oldState.member.id !== "236982767080964097" || !newState.member || newState.member.id !== "236982767080964097") {
        return;
    }

    // Joined channel, previously was not in the server
    if ((!oldState.channel && newState.channel) || (oldState.guild.id !== newState.guild.id)) {
        joinDate = Date.now();
    }

    if (joinDate && (newState.selfDeaf || !newState.channel || newState.guild.id !== oldState.guild.id)) {
        let diff = Date.now() - joinDate;
        joinDate = null;
        
        const owner = await newState.client.users.fetch(newState.client.config.ownerID);

        if (!owner) return;

        const dm = await owner.createDM();

        if (!dm) return;

        await dm.send({ content: `Dylan just left, he joined **${timeAgo.format(diff)}** `});        
    }
    
};