import { SKRSContext2D } from '@napi-rs/canvas';

export function writeText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number,
    ctx: SKRSContext2D,
): void {
    let lineWidth = 0;

    let xOffset = x;
    let yOffset = y;

    for (const word of text.split(' ')) {
        const measure = ctx.measureText(` ${word} `);
        if (measure.width > maxWidth) {
            // Add word by character
            for (const char of word) {
                const charMeasure = ctx.measureText(char);
                if (lineWidth + charMeasure.width > maxWidth) {
                    xOffset = x;
                    yOffset += fontSize;
                    lineWidth = 0;
                }
                ctx.fillText(char, xOffset, yOffset);
                lineWidth += charMeasure.width;
                xOffset += charMeasure.width;
            }
        } else {
            if (lineWidth + measure.width > maxWidth) {
                xOffset = x;
                yOffset += fontSize;
                lineWidth = 0;
                ctx.fillText(`${word} `, xOffset, yOffset);
            } else {
                ctx.fillText(` ${word} `, xOffset, yOffset);
            }

            lineWidth += measure.width;
            xOffset += measure.width;
        }
    }

    ctx.save();
}

export function isValidHttpUrl(string: string): boolean {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
}
