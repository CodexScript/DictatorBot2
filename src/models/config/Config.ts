import { TiktokConfig } from './TiktokConfig.js';

export interface Config {
    botToken: string
    ownerID: string
    socialCreditDatabase: {
        host: string,
        port: number,
        user: string,
        password: string
    },
    socialCreditPhrases: Map<string, number>
    socialCreditRegex: Map<string, number>
    invalidCommandPenalty: number
    lavalink: {
        ip: string,
        port: number,
        password: string
    },
    tiktok: TiktokConfig
}