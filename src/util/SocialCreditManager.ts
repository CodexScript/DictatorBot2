import canvas from '@napi-rs/canvas';
import { GuildMember, Message } from 'discord.js';
import * as fs from 'fs/promises';
import got from 'got';
import * as BetterSqlite3 from 'better-sqlite3';
import SocialCreditTier from '../models/SocialCreditTier.js';

canvas.GlobalFonts.registerFromPath('./assets/font/seven-monkey-fury-bb.regular.ttf', 'Seven Monkey Fury BB');

export async function setSocialCredit(
  client: BetterSqlite3.Database,
  userID: string,
  socialCredit: number
) {
  // await client.set(`social_credit:${userID}`, socialCredit);
  return;
}

export async function getSocialCredit(
  client: BetterSqlite3.Database,
  userID: string
) {
  // const res = await client.get(`social_credit:${userID}`);
  // if (res === null) {
  //   await setSocialCredit(client, userID, 1000);
  //   return 1000;
  // }
  // return parseInt(res, 10);
  return 1;
}

export async function addSocialCredit(
  client: BetterSqlite3.Database,
  userID: string,
  socialCredit: number
) {
  // const currentSocialCredit = await getSocialCredit(client, userID);
  // await setSocialCredit(client, userID, currentSocialCredit + socialCredit);
  return;
}

export async function setSocialCreditFromMessage(
  client: BetterSqlite3.Database,
  message: Message,
  reasons: Array<string>,
  socialCredit: number,
  reply = true
) {
//   const userID = message.author.id;
//   await setSocialCredit(client, userID, socialCredit);
//   if (reply) {
//     await message.reply(`Your new social credit: ${socialCredit}
// Reasons:\n>${reasons.join('\n>')}`);
//   }
  return;
}

export async function addSocialCreditFromMessage(
  client: BetterSqlite3.Database,
  message: Message,
  reasons: Array<string>,
  socialCredit: number,
  reply = true
) {
//   const userID = message.author.id;
//   const currentSocialCredit = await getSocialCredit(client, userID);
//   await setSocialCredit(client, userID, currentSocialCredit + socialCredit);
//   if (reply) {
//     await message.reply(`Your new social credit: ${currentSocialCredit + socialCredit}
// Reasons:\n>${reasons.join('\n>')}`);
//   }
  return;
}

export function getSocialCreditTier(socialCredit: number): SocialCreditTier {
  if (socialCredit < 600) {
    return new SocialCreditTier(SocialCreditTier.D);
  }
  if (socialCredit < 850) {
    return new SocialCreditTier(SocialCreditTier.C);
  }
  if (socialCredit < 960) {
    return new SocialCreditTier(SocialCreditTier.B);
  }
  if (socialCredit < 984) {
    return new SocialCreditTier(SocialCreditTier.AMINUS);
  }
  if (socialCredit < 1007) {
    return new SocialCreditTier(SocialCreditTier.A);
  }
  if (socialCredit < 1030) {
    return new SocialCreditTier(SocialCreditTier.APLUS);
  }
  if (socialCredit < 1050) {
    return new SocialCreditTier(SocialCreditTier.AA);
  }
  return new SocialCreditTier(SocialCreditTier.AAA);
}

export async function createUserBanner(
  client: BetterSqlite3.Database,
  member: GuildMember
): Promise<Buffer> {
  const socialCredit = await getSocialCredit(client, member.id);
  const tier = getSocialCreditTier(socialCredit);

  const avatar = await got.get(member.displayAvatarURL({forceStatic: true})).buffer();

  const flagBuffer = await fs.readFile('./assets/picedit/china.png');

  const flag = await canvas.loadImage(flagBuffer);
  const avatarImage = await canvas.loadImage(avatar);

  const drawCanvas = canvas.createCanvas(flag.width, flag.height);
  const ctx = drawCanvas.getContext('2d');

  ctx.drawImage(flag, 0, 0);

  ctx.drawImage(
    avatarImage,
    flag.width / 2 - avatarImage.width,
    flag.height / 2,
    avatarImage.width * 2,
    avatarImage.height * 2
  );

  ctx.font = 'plain 72px Seven Monkey Fury BB';
  ctx.fillStyle = '#FFFF00';

  ctx.fillText('Social Credit:', 700, 150);
  ctx.fillText(socialCredit.toString(), 700, 250);
  ctx.fillText(`Tier: ${tier.toString()}`, 700, 350);

  const username = `${member.nickname ? member.nickname : member.user.username} Citizen no. ${member.user.discriminator}`;

  ctx.font = `plain ${(72 / (username.length / 32)).toFixed(0)}px Seven Monkey Fury BB`;

  ctx.fillText(username, flag.width / 2 - ctx.measureText(username).width / 2, flag.height - 50);

  ctx.save();

  return drawCanvas.toBuffer("image/png");
}
