import { TiktokConfig } from './TiktokConfig.js';

export interface Config {
    botToken: string
    clientID: string
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
    lavalinkIP: string
    lavalinkPort: number
    lavalinkPassword: string
    tiktok: TiktokConfig
}