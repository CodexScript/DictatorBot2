import got from 'got';
import { AppleMusicAccessToken, signToken } from './AppleMusicAccessToken';

export default class AppleMusicClient {
  accessToken: AppleMusicAccessToken;

  constructor(keyId: string, teamId: string, secret: string) {
    this.accessToken = new AppleMusicAccessToken(keyId, teamId, secret);
  }

  public async getSongByISRC(isrc: string): Promise<unknown> {
    if (this.shouldResignAccessToken()) {
      this.accessToken = await signToken(this.accessToken);
    }

    const response = await got.get(`https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${isrc}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    }).json();

    return response;
  }

  public async getAlbumByUPC(upc: string): Promise<unknown> {
    if (this.shouldResignAccessToken()) {
      this.accessToken = await signToken(this.accessToken);
    }

    const response = await got.get(`https://api.music.apple.com/v1/catalog/us/albums?filter[upc]=${upc}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    }).json();

    return response;
  }

  private shouldResignAccessToken(): boolean {
    if (this.accessToken.token === undefined || this.accessToken.exp === undefined
      || this.accessToken.iat === undefined) {
      return true;
    }

    const now = new Date();

    if (this.accessToken.exp < now.getTime() / 1000) {
      return true;
    }

    return false;
  }
}
