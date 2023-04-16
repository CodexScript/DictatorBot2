import Bot from '../../models/Bot';
import { Config } from '../../models/config/Config';
import yaml from 'js-yaml';
import * as fs from 'fs';

export async function getCurrentPfp(config: Config): Promise<string | null> {
    return config.pfp.current;
}

export async function setPfp(client: Bot, pfp: string, force = false): Promise<void> {
    client.config.pfp.current = pfp;
    client.config.pfp.forced = force;
    const readyYaml = yaml.dump(client.config, { quotingType: '"' });
    fs.writeFile('./config.yml', readyYaml, (err: any) => {
        if (err) {
            console.error(err);
        }
    });
}

export async function writeConfig(config: Config) {
    const readyYaml = yaml.dump(config, { quotingType: '"' });
    fs.writeFile('./config.yml', readyYaml, (err: any) => {
        if (err) {
            console.error(err);
        }
    });
}
