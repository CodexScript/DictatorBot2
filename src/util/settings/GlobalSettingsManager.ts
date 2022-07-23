import Bot from '../../models/Bot';
import { Config } from '../../models/config/Config';
import yaml from 'js-yaml';
import * as fs from 'fs';

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
  const readyYaml = yaml.dump(client.config, { quotingType: '"'});
  fs.writeFile('./config.yml', readyYaml, (err: any) => {
    if (err) {
      console.error(err);
    }
  });
}
