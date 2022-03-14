import jwt from 'jsonwebtoken';

export default class AppleMusicClient {
	keyId: string;
	teamId: string;
	secret: string;
	constructor(keyId: string, teamId: string, secret: string) {
		this.keyId = keyId;
		this.teamId = teamId;
		this.secret = secret;
	}

	public async getAccessToken(): Promise<string> {
		const now = new Date();
		const expiresAt = new Date(now.getTime() + 3600 * 1000);

		const payload = {
			'iss': this.teamId,
			'iat': now.getTime() / 1000,
			'exp': expiresAt.getTime() / 1000,
		};

	 	return await jwt.sign(payload, this.secret, { algorithm: 'ES256', keyid: this.keyId, expiresIn: '1h' });
	}
}