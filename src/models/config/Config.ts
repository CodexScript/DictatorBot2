import { TiktokConfig } from './TiktokConfig.js';

export interface Config {
    botToken: string;
    ownerID: string;
    pfp: {
        current: string;
        forced: boolean;
    };
    adminGuildID: string;
    mainGuildID: string;
    socialCreditPhrases: Map<string, number>;
    socialCreditRegex: Map<string, number>;
    bannedFromGPT: string[];
    bannedFromMusic: string[];
    guildsBannedFromMusic: string[];
    invalidCommandPenalty: number;
    APImusicURL: string;
    minecraft: {
        serverIP: string;
        rconPort: number;
        rconPassword: string;
    } | null;
    lavalink: {
        ip: string;
        port: number;
        password: string;
    };
    spotify: {
        token: string;
        secret: string;
    };
    imgur: {
        clientId: string;
        clientSecret: string;
    };
    tiktok: TiktokConfig;
}
