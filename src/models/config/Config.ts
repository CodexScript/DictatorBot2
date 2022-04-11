import { TiktokConfig } from './TiktokConfig.js';

export interface Config {
  botToken: string
  ownerID: string
  adminGuildID: string
  settingsDatabase: {
    host: string,
    port: number,
    password: string
  },
  socialCreditPhrases: Map<string, number>
  socialCreditRegex: Map<string, number>
  invalidCommandPenalty: number
  lavalink: {
    ip: string,
    port: number,
    password: string
    linkBlacklist: string[]
    titleBlacklist: string[]
  },
  spotify: {
    token: string,
    secret: string
  },
  imgur: {
    clientId: string,
    clientSecret: string,
  }
  tiktok: TiktokConfig
}
