import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
import postgres from 'postgres';
dayjs.extend(duration);

interface TimeData {
    time_total: number,
    time_deafen: number
}

export async function createDeafenTable(sql: postgres.Sql<{}>) {
    await sql`
        CREATE TABLE IF NOT EXISTS deafen_table (
            id BIGINT PRIMARY KEY,
            time_total INTEGER NOT NULL DEFAULT 0,
            time_deafen INTEGER NOT NULL DEFAULT 0
        );
    `
}

export async function addTotalTime(sql: postgres.Sql<{}>, id: string, time: number) {
    const result = await sql`
        INSERT INTO deafen_table (id, time_total, time_deafen)
        VALUES (${id}, ${time}, 0)
        ON CONFLICT (id) DO UPDATE
        SET time_total = deafen_table.time_total + EXCLUDED.time_total
        RETURNING time_total;
    `
}

export async function addDeafenTime(sql: postgres.Sql<{}>, id: string, time: number) {
    const result = await sql`
        INSERT INTO deafen_table (id, time_total, time_deafen)
        VALUES (${id}, 0, ${time})
        ON CONFLICT (id) DO UPDATE
        SET time_deafen = deafen_table.time_deafen + EXCLUDED.time_deafen
        RETURNING time_deafen;
    `
}

export async function getTimeData(sql: postgres.Sql<{}>) {
    const result = await sql`
        SELECT *
        FROM deafen_table;
    `

    if (result.length === 0) {
        return null;
    }

    return result
}

export function msToReadable(ms: number) {
    const dur = dayjs.duration(ms);
    const years = dur.years();
    const months = dur.months();
    const days = dur.days();
    const hours = dur.hours();
    const minutes = dur.minutes();
    const seconds = dur.seconds();

    let readable = '';

    if (years) readable += `${years} year${years > 1 ? 's' : ''} `;
    if (months) readable += `${months} month${months > 1 ? 's' : ''} `;
    if (days) readable += `${days} day${days > 1 ? 's' : ''} `;
    if (hours) readable += `${hours} hour${hours > 1 ? 's' : ''} `;
    if (minutes) readable += `${minutes} minute${minutes > 1 ? 's' : ''} `;
    if (seconds) readable += `${seconds} second${seconds > 1 ? 's' : ''} `;

    return readable.trim();
}