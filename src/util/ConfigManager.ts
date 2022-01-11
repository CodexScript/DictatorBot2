import { Config } from "../models/config/Config.js";
import yaml from 'js-yaml'
import * as fs from 'fs';

export const config = yaml.load(fs.readFileSync('../config.yml', 'utf8')) as Config;