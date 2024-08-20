import { Events, VoiceState } from 'discord.js';
import { messageOwner } from '../util/AdminUtils.js';
import { addDeafenTime, addTotalTime } from '../util/DeafenUtil.js';

type UserAudioState = {
    [key: string]: {
        joinDate: number | null;
        deafenTime: number | null;
    }
};

const deafenMap: UserAudioState = {};

export const name = Events.VoiceStateUpdate;
export const once = false;
export const execute = async (oldState: VoiceState, newState: VoiceState) => {
    if (!oldState.member || !newState.member) {
        return;
    }

    if (Object.hasOwn(deafenMap, newState.member.id) && Object.hasOwn(deafenMap[newState.member.id], 'deafenTime') && deafenMap[newState.member.id]['deafenTime'] !== null && newState.selfDeaf === false && newState.selfMute === false) {
        const diff = Date.now() - deafenMap[newState.member.id]['deafenTime']!;
        deafenMap[newState.member.id]['deafenTime'] = null;
        await addDeafenTime(oldState.client.sql, oldState.member.id, diff);
    }

    // Joined channel, previously was not in the server
    if ((!oldState.channel && newState.channel) || (newState.channel && oldState.guild.id !== newState.guild.id)) {
        if (newState.selfDeaf || newState.selfMute) {
            deafenMap[newState.member.id] = {
                'deafenTime': Date.now(),
                'joinDate': Date.now()
            };
        } else {
            deafenMap[newState.member.id] = {
                'deafenTime': null,
                'joinDate': Date.now()
            };
        }
    }

    // Deafened or muted
    // Must be in a channel and in the same guild as old state
    if (newState.channel && newState.guild.id === oldState.guild.id && (oldState.selfDeaf === false && oldState.selfMute === false) && (newState.selfDeaf || newState.selfMute)) {
        if (!Object.hasOwn(deafenMap, newState.member.id) || !Object.hasOwn(deafenMap[newState.member.id], 'joinDate')) return;
        deafenMap[newState.member.id]['deafenTime'] = Date.now();        
    }

    // No longer exists in any channel, or left to a different server, or went idle
    if (!newState.channel || (newState.channel && newState.guild.id !== oldState.guild.id) || newState.member.presence?.status === 'idle') {
        if (!Object.hasOwn(deafenMap, oldState.member.id) || !Object.hasOwn(deafenMap[oldState.member.id], 'joinDate') || deafenMap[oldState.member.id]['joinDate'] === null) {
            console.warn("Left with no join date");
            await messageOwner(newState.client, {content: "Left with no join date " + newState.member.id});
            return;
        }
        const diff = Date.now() - deafenMap[newState.member.id]['joinDate']!;
        await addTotalTime(oldState.client.sql, oldState.member.id, diff);
        
        if (Object.hasOwn(deafenMap, newState.member.id) && Object.hasOwn(deafenMap[newState.member.id], 'deafenTime') && deafenMap[newState.member.id]['deafenTime'] !== null) {
            const deafDiff = Date.now() - deafenMap[newState.member.id]['deafenTime']!;
            deafenMap[newState.member.id]['deafenTime'] = null;
            await addDeafenTime(oldState.client.sql, oldState.member.id, deafDiff);
        }
        
        delete deafenMap[oldState.member.id];
    }
    
};