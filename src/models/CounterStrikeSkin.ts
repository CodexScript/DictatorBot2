export interface CounterStrikeSkin {
    name: string;
    stattrak: boolean;
    floatValue: number | null;
    wear: string;
    price: number;
    rarity: 'Blue' | 'Purple' | 'Pink' | 'Red' | 'Gold';
}

export interface ScrapedSkin {
    name: string;
    img: string;
    rarity: 'Blue' | 'Purple' | 'Pink' | 'Red' | 'Gold';
    stattrak: boolean;
    pricing: {
        [key: string]: number | null;
    };
    minWear: number | null;
    maxWear: number | null;
}