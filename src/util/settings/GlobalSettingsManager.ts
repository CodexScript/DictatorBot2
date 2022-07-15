import Bot from '../../models/Bot';
import { Config } from '../../models/config/Config';

export async function getCurrentPfp(
  config: Config
): Promise<string | null> {
  return config.currentPfp;
}

export async function setPfp(
  client: Bot,
  pfp: string
): Promise<void> {
  client.config.currentPfp = pfp;
}
