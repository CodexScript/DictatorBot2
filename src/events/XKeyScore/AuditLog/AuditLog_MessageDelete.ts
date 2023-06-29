import { Events, Message, EmbedBuilder, TextChannel, ThreadChannel, GuildAuditLogsEntry, AuditLogEvent } from "discord.js";
import { getBot } from "../../../index.js";

export const name = Events.GuildAuditLogEntryCreate;
export const once = false;
export const execute = async (auditLog: GuildAuditLogsEntry) => {

    const bot = getBot();

    const { action, extra: channel, executorId, targetId, createdAt, reason, targetType, changes, id } = auditLog;

    console.log(auditLog.action);
    console.log("TARGET ID: " + targetId);
    console.log("ID: " + id);
    
    if (auditLog.action !== AuditLogEvent.MessageDelete || targetId === null || executorId === null) return;

    bot.XKeyscore.auditsInbound[id] = auditLog;
    
}