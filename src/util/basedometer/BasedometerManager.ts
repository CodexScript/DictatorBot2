import { Collection, Snowflake } from 'discord.js';
import * as fs from 'fs/promises';
import { BasedometerCategory, BasedometerEntry } from '../../models/basedometer/Basedometer.js';
import BasedometerInstance from './BasedometerInstance.js';

export default class BasedometerManager {
  readonly instances = new Collection<Snowflake, BasedometerInstance>();

  readonly categories = new Collection<string, BasedometerCategory>();

  constructor() {
    setInterval(async () => {
      const now = new Date();
      for (const [, instance] of this.instances) {
        if (now.getTime() - instance.lastInteraction.getTime() > 15000 * 60) {
          await instance.finishQuiz(true);
        }
      }
    }, 5000 * 60);
  }

  async populateCategories() {
    const data = await fs.readFile('./assets/rating/categories.json', 'utf8');
    const categories = JSON.parse(data) as Array<BasedometerCategory>;
    for (const category of categories) {
      const metadata = await fs.readFile(`./assets/rating/${category.directoryName}/metadata.json`, 'utf-8');
      category.entries = JSON.parse(metadata) as Array<BasedometerEntry>;
      this.categories.set(category.directoryName, category);
    }
  }
}
