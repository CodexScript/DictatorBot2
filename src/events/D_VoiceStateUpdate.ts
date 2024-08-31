import { Events, VoiceState } from 'discord.js';
import { messageOwner } from '../util/AdminUtils.js';
import { addDeafenTime, addTotalTime } from '../util/DeafenUtil.js';

type UserAudioState = {
    joinDate: number | null;
    deafenTime: number | null;
};

const deafenMap: Map<string, UserAudioState> = new Map();

export const name = Events.VoiceStateUpdate;
export const once = false;
export const execute = async (oldState: VoiceState, newState: VoiceState) => {
    if (!oldState.member || !newState.member) {
        return;
    }

    const userId = newState.member.id;
    const userState = deafenMap.get(userId);

    if (userState && userState.deafenTime !== null && newState.selfDeaf === false && newState.selfMute === false) {
        const diff = Date.now() - userState.deafenTime;
        userState.deafenTime = null;
        deafenMap.set(userId, userState);
        await addDeafenTime(oldState.client.sql, userId, diff);
    }

    // Joined channel, previously was not in the server
    if ((!oldState.channel && newState.channel) || (newState.channel && oldState.guild.id !== newState.guild.id)) {
        const newUserState: UserAudioState = {
            deafenTime: newState.selfDeaf || newState.selfMute ? Date.now() : null,
            joinDate: Date.now()
        };
        deafenMap.set(userId, newUserState);
    }

    // Deafened or muted
    // Must be in a channel and in the same guild as old state
    if (newState.channel && newState.guild.id === oldState.guild.id && 
        (oldState.selfDeaf === false && oldState.selfMute === false) && 
        (newState.selfDeaf || newState.selfMute)) {
        const existingState = deafenMap.get(userId);
        if (existingState) {
            existingState.deafenTime = Date.now();
            deafenMap.set(userId, existingState);
        }
    }

    // No longer exists in any channel, or left to a different server, or went idle
    if (!newState.channel || (newState.channel && newState.guild.id !== oldState.guild.id) || newState.member.presence?.status === 'idle') {
        const existingState = deafenMap.get(userId);
        if (!existingState || existingState.joinDate === null) {
            console.warn("Left with no join date");
            await messageOwner(newState.client, {content: "Left with no join date " + userId});
            return;
        }
        const diff = Date.now() - existingState.joinDate;
        await addTotalTime(oldState.client.sql, userId, diff);
        
        if (existingState.deafenTime !== null) {
            const deafDiff = Date.now() - existingState.deafenTime;
            await addDeafenTime(oldState.client.sql, userId, deafDiff);
        }
        
        deafenMap.delete(userId);
    }
    
};