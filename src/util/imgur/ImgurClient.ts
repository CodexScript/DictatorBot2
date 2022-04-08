import got from 'got';

const BASE_URL = 'https://api.imgur.com/3';

export class ImgurClient {
  clientId: string;

  clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getAlbum(albumId: string): Promise<ImgurAlbum> {
    return await got.get(`${BASE_URL}/album/${albumId}`, {
      headers: {
        Authorization: `Client-ID ${this.clientId}`
      }
    }).json() as ImgurAlbum;
  }
}

export interface ImgurAlbum {
  data: {
    id: string;
    title: string;
    description: string;
    datetime: number;
    cover: string;
    cover_width: number;
    cover_height: number;
    account_url: string | null;
    account_id: string | null;
    privacy: string;
    layout: string;
    views: number;
    link: string;
    favorite: boolean;
    nsfw: boolean | null;
    section: string;
    order: number;
    deletehash: string | undefined;
    images_count: number;
    images: ImgurImage[];
    in_gallery: boolean;
  };
}

export interface ImgurImage {
  id: string;
  title: string;
  description: string;
  datetime: number;
  type: string;
  animated: boolean;
  width: number;
  height: number;
  size: number;
  views: number;
  bandwidth: number;
  deletehash: string | undefined;
  name: string | undefined;
  link: string;
  gifv: string | undefined;
  mp4: string | undefined;
  mp4_size: number | undefined;
  looping: boolean | undefined;
  favorite: boolean;
  nsfw: boolean | null;
  vote: string | null;
  in_gallery: boolean;
}
