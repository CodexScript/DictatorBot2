import jwt from 'jsonwebtoken';

export class AppleMusicAccessToken {
    token: string | undefined;

    iss: string;

    iat: number | undefined;

    exp: number | undefined;

    keyId: string;

    secret: string;

    constructor(keyId: string, teamId: string, secret: string) {
        this.keyId = keyId;
        this.iss = teamId;
        this.secret = secret;
    }
}

export async function signToken(token: AppleMusicAccessToken): Promise<AppleMusicAccessToken> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3600 * 1000);

    const newToken = new AppleMusicAccessToken(token.keyId, token.iss, token.secret);
    newToken.exp = expiresAt.getTime() / 1000;
    newToken.iat = now.getTime() / 1000;

    const payload = {
        iss: token.iss,
        iat: newToken.iat,
        exp: newToken.exp,
    };

    newToken.token = await jwt.sign(payload, token.secret, { algorithm: 'ES256', keyid: token.keyId, expiresIn: '1h' });

    return newToken;
}
