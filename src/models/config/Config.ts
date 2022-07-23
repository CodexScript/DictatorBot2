import { TiktokConfig } from './TiktokConfig.js';

export interface Config {
  botToken: string
  ownerID: string
  currentPfp: string | null
  adminGuildID: string
  socialCreditPhrases: Map<string, number>
  socialCreditRegex: Map<string, number>
  invalidCommandPenalty: number
  openaiToken: string | null
  lavalink: {
    ip: string,
    port: number,
    password: string
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
