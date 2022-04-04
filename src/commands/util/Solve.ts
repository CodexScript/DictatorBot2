import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageAttachment } from 'discord.js';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as SocialCreditManager from '../../util/SocialCreditManager.js';

export const data = new SlashCommandBuilder()
  .setName('solve')
  .setDescription('Reveal the solution behind the paywall of a school problem website.')
  .addSubcommand((subcommand) => subcommand
    .setName('chegg')
    .setDescription('Show the solution to the provided problem from Chegg.')
    .addStringOption((option) => option
      .setName('url')
      .setDescription('The problem URL.')
      .setRequired(true)));

export async function execute(interaction: CommandInteraction): Promise<void> {
  const url = interaction.options.getString('url');

  // url == null is the same as url === undefined || url === null
  if (url == null) {
    await interaction.reply({ content: 'You must specify a URL.', ephemeral: true });
    return;
  }

  try {
    const urlObject = new URL(url);
    if (urlObject.hostname !== 'chegg.com' && urlObject.hostname !== 'www.chegg.com') {
      await interaction.reply({ content: `Not a Chegg URL! Hostname: ${urlObject.hostname}`, ephemeral: true });
      return;
    }
  } catch {
    await interaction.reply({ content: 'Invalid URL.', ephemeral: true });
    return;
  }

  await interaction.deferReply();

  if (interaction.options.getSubcommand() === 'chegg') {
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url);

    let cookies;

    if (fsSync.existsSync('./assets/solve/chegg-cookies.json')) {
      const cookieData = await fs.readFile('./assets/solve/chegg-cookies.json', 'utf8');
      cookies = JSON.parse(cookieData);
    } else {
      const cookieData = await fs.readFile('./assets/solve/chegg-cookies-quick.json', 'utf8');
      cookies = parseCookies(cookieData);
    }

    const storageData = await fs.readFile('./assets/solve/chegg-local-storage.json', 'utf8');
    const storage = JSON.parse(storageData);

    // eslint-disable-next-line no-shadow
    await page.evaluate((storage) => {
      for (const key in storage) {
        localStorage.setItem(key, storage[key]);
      }
    }, storage);

    await page.setCookie(...cookies);

    await page.reload();

    await page.waitForTimeout(5000);

    const screen = await page.screenshot({ fullPage: true });

    const newCookies = JSON.stringify(await page.cookies());

    await fs.writeFile('./assets/solve/chegg-cookies.json', newCookies, 'utf8');

    await browser.close();

    const attach = new MessageAttachment(screen);

    await interaction.followUp({ files: [attach] });
  }

  await SocialCreditManager.addSocialCredit(
    interaction.client.redisClient,
    interaction.user.id,
    10
  );
}

function parseCookies(cookies: string) {
  const jsonCookies = [];

  for (const obj of JSON.parse(cookies)) {
    jsonCookies.push({
      name: obj['Name raw'],
      value: obj['Content raw'],
      domain: obj['Host raw'],
      path: obj['Path raw'],
      expires: parseFloat(obj['Expires raw']),
      httpOnly: obj['HTTP only raw'] === 'true',
      secure: obj['Send for raw'] === 'true',
      session: obj['Expires raw'] === '0',
      sameSite: obj['SameSite raw'],
    });
  }

  console.log(jsonCookies);

  return jsonCookies;
}
