import canvas from 'canvas';
import { GuildMember, Message } from 'discord.js';
import { SocialCreditTier } from '../models/SocialCreditTier.js';
import * as fs from 'fs/promises';
import got from 'got';
import pg from 'pg';


let CLIENT: pg.Client;

export async function establishConnection(options: {host: string, port: number, user: string, password: string}) {
	const host = options.host;
	const port = options.port;
	const user = options.user;
	const password = options.password;
	CLIENT = new pg.Client({
		host: host,
		port: port,
		user: user,
		password: password,
		database: 'SOCIAL_CREDIT',

	});

	await CLIENT.connect();
	await CLIENT.query('CREATE TABLE IF NOT EXISTS social_credit (user_id TEXT PRIMARY KEY, social_credit INTEGER NOT NULL DEFAULT 1000)');

	canvas.registerFont('./assets/font/seven-monkey-fury-bb.regular.ttf', { family: 'Seven Monkey Fury BB' });

}

export async function getSocialCredit(userID: string) {
	const res = await CLIENT.query('SELECT social_credit FROM social_credit WHERE user_id = $1', [userID]);
	if (res.rowCount === 0) {
		await setSocialCredit(userID, 1000);
		return 1000;
	}
	return res.rows[0].social_credit;
}

export async function setSocialCredit(userID: string, socialCredit: number) {
	await CLIENT.query('INSERT INTO social_credit (user_id, social_credit) VALUES ($1, $2) ON CONFLICT (user_id) DO UPDATE SET social_credit = $2', [userID, socialCredit]);
	// await CLIENT.query('INSERT OR REPLACE INTO social_credit (user_id, social_credit) VALUES ($1, $2)', [userID, socialCredit]);
}

export async function addSocialCredit(userID: string, socialCredit: number) {
	const currentSocialCredit = await getSocialCredit(userID);
	await setSocialCredit(userID, currentSocialCredit + socialCredit);
}

export async function setSocialCreditFromMessage(message: Message, reasons: Array<string>, socialCredit: number, reply = true) {
	const userID = message.author.id;
	await setSocialCredit(userID, socialCredit);
	if (reply) {
		await message.reply(`Your new social credit: ${socialCredit}
		Reasons:\n>${reasons.join('\n>')}`);
	}
}

export async function addSocialCreditFromMessage(message: Message, reasons: Array<string>, socialCredit: number, reply = true) {
	const userID = message.author.id;
	const currentSocialCredit = await getSocialCredit(userID);
	await setSocialCredit(userID, currentSocialCredit + socialCredit);
	if (reply) {
		await message.reply(`Your new social credit: ${currentSocialCredit + socialCredit}
		Reasons:\n>${reasons.join('\n>')}`);
	}
}

export function getSocialCreditTier(socialCredit: number): SocialCreditTier {
	if (socialCredit < 600) {
		return new SocialCreditTier(SocialCreditTier.D);
	}
	else if (socialCredit < 850) {
		return new SocialCreditTier(SocialCreditTier.C);
	}
	else if (socialCredit < 960) {
		return new SocialCreditTier(SocialCreditTier.B);
	}
	else if (socialCredit < 984) {
		return new SocialCreditTier(SocialCreditTier.AMINUS);
	}
	else if (socialCredit < 1007) {
		return new SocialCreditTier(SocialCreditTier.A);
	}
	else if (socialCredit < 1030) {
		return new SocialCreditTier(SocialCreditTier.APLUS);
	}
	else if (socialCredit < 1050) {
		return new SocialCreditTier(SocialCreditTier.AA);
	}
	return new SocialCreditTier(SocialCreditTier.AAA);
}

export async function createUserBanner(member: GuildMember): Promise<Buffer> {
	const socialCredit = await getSocialCredit(member.id);
	const tier = getSocialCreditTier(socialCredit);

	const avatar = await got.get(member.displayAvatarURL({ format: 'png' })).buffer();

	const flagBuffer = await fs.readFile('./assets/picedit/china.png');

	const flag = await canvas.loadImage(flagBuffer);
	const avatarImage = await canvas.loadImage(avatar);

	const drawCanvas = canvas.createCanvas(flag.width, flag.height);
	const ctx = drawCanvas.getContext('2d');

	ctx.drawImage(flag, 0, 0);

	ctx.drawImage(avatarImage, flag.width / 2 - avatarImage.width, flag.height / 2, avatarImage.width * 2, avatarImage.height * 2);

	ctx.font = 'plain 72px Seven Monkey Fury BB';
	ctx.fillStyle = '#FFFF00';

	ctx.fillText('Social Credit:', 700, 150);
	ctx.fillText(socialCredit, 700, 250);
	ctx.fillText(`Tier: ${tier.toString()}`, 700, 350);

	const username = `${member.nickname ? member.nickname : member.user.username} Citizen no. ${member.user.discriminator}`;

	ctx.font = `plain ${(72 / (username.length / 32)).toFixed(0)}px Seven Monkey Fury BB`;

	ctx.fillText(username, flag.width / 2 - ctx.measureText(username).width / 2, flag.height - 50);

	ctx.save();

	return drawCanvas.toBuffer();
}
