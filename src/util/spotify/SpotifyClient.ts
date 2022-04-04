import got from 'got';
import {
  SpotifyAccessToken,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifySearchResult,
  SpotifyTrack
} from '../../models/Spotify';

export default class SpotifyClient {
  private clientId: string;

  private clientSecret: string;

  private accessToken: SpotifyAccessToken | undefined;

  private BASE_URL: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.BASE_URL = 'https://api.spotify.com/v1';
  }

  public async getAccessToken(): Promise<SpotifyAccessToken> {
    if (this.accessToken && !this.IsTokenExpired()) {
      return this.accessToken;
    }

    const authData = await got.post('https://accounts.spotify.com/api/token', {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        grant_type: 'client_credentials',
      },
    }).json() as SpotifyAccessToken;

    authData.created_at = new Date();

    return authData;
  }

  public async initialize() {
    this.accessToken = await this.getAccessToken();
  }

  public IsInitialized(): boolean {
    return this.accessToken !== undefined;
  }

  public IsTokenExpired(): boolean {
    if (!this.accessToken) {
      return true;
    }
    return this.accessToken.created_at.getTime() + this.accessToken.expires_in * 1000
     < new Date().getTime();
  }

  public async search(q: string, type: Array<string>, options?:
  { include_external?: string, limit?: number, market?: string, offset?: number }):
    Promise<SpotifySearchResult> {
    if (!this.IsInitialized()) {
      await this.initialize();
    }

    return await got.get(`${this.BASE_URL}/search?q=${q}&type=${type.join(',')}${options?.include_external ? `&include_external=${options.include_external}` : ''}${options?.limit ? `&limit=${options?.limit}` : ''}${options?.market ? `&market=${options?.market}` : ''}${options?.offset ? `&offset=${options?.offset}` : ''}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken?.access_token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    }).json() as SpotifySearchResult;
  }

  public async getTrack(id: string): Promise<SpotifyTrack> {
    if (!this.IsInitialized()) {
      await this.initialize();
    }

    return await got.get(`${this.BASE_URL}/tracks/${id}?market=us`, {
      headers: {
        Authorization: `Bearer ${this.accessToken?.access_token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    }).json() as SpotifyTrack;
  }

  public async getAlbum(id: string): Promise<SpotifyAlbum> {
    if (!this.IsInitialized()) {
      await this.initialize();
    }

    return await got.get(`${this.BASE_URL}/albums/${id}?market=us`, {
      headers: {
        Authorization: `Bearer ${this.accessToken?.access_token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    }).json() as SpotifyAlbum;
  }

  public async getArtist(id: string): Promise<SpotifyArtist> {
    if (!this.IsInitialized()) {
      await this.initialize();
    }

    return await got.get(`${this.BASE_URL}/artists/${id}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken?.access_token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    }).json() as SpotifyArtist;
  }
}
