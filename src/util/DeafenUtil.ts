import fs from 'node:fs';
import fspromises from 'node:fs/promises';

import DeafenTimes from '../models/DeafenTimes.js';

import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';
dayjs.extend(duration);

export function readJSONSync() {
    let json;
    if (fs.existsSync('./assets/dylan.json')) {
        const data = fs.readFileSync('./assets/dylan.json', 'utf8');
        json = JSON.parse(data) as DeafenTimes;
    } else {
        json = {
            "totalDeafenTime": 0,
            "totalTime": 0
        };
    
        fs.writeFileSync('./assets/dylan.json', JSON.stringify(json, null, 2), 'utf8');
    }

    return json;
}

export async function readJSON() {
    try {
        const fd = await fspromises.open('./assets/dylan.json', 'r');
        const content = await fd.readFile('utf8');
        await fd.close();
        return JSON.parse(content) as DeafenTimes;
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            const json = {
                "totalDeafenTime": 0,
                "totalTime": 0
            };

            const fd = await fspromises.open('./assets/dylan.json', 'w');
        
            await fd.writeFile(JSON.stringify(json, null, 2), 'utf8');
            await fd.close();

            return json as DeafenTimes;
        } else {
            throw err;
        }
    }
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