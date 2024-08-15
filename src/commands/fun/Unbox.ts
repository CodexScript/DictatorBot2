import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import fs from 'node:fs';
import { messageOwner } from '../../util/AdminUtils.js';

const casesFile = fs.readFileSync('./assets/skins.json', 'utf-8');
const cases = JSON.parse(casesFile);

function getWear(floatValue: number | null) {
    if (!floatValue) {
        return "Vanilla";
    }

    if (floatValue >= 0 && floatValue <= 1) {
        if (floatValue >= 0.00 && floatValue <= 0.07) {
            return "Factory New";
        } else if (floatValue > 0.07 && floatValue <= 0.15) {
            return "Minimal Wear";
        } else if (floatValue > 0.15 && floatValue <= 0.38) {
            return "Field-Tested";
        } else if (floatValue > 0.38 && floatValue <= 0.45) {
            return "Well-Worn";
        } else if (floatValue > 0.45 && floatValue <= 1.00) {
            return "Battle-Scarred";
        } 
    } else {
        return null;
    }
}

function getRarityHex(rarity: string) {
    if (rarity === "Red") {
        return 0xD95752;
    } else if (rarity === "Pink") {
        return 0xC23EDE;
    } else if (rarity === "Purple") {
        return 0x7F4AF6;
    } else if (rarity === "Blue") {
        return 0x5168F6;
    } else if (rarity === "Gold") {
        return 0xF9D849;
    } else {
        return null;
    }
}

const choices: any = [];

const possibleCases = Object.keys(cases);

for (const csCase of possibleCases) {
    choices.push({ name: csCase, value: csCase });
    if (choices.length == 25) {
        break;
    }
}

export const data = new SlashCommandBuilder()
    .setName('unbox')
    .setDescription('Simulate unboxing a CS case.')
    .addStringOption((option) =>
        option
            .setName('case')
            .setDescription('The case to unbox.')
            .setRequired(false)
            .addChoices(...choices),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    
    let csCase = interaction.options.getString('case');
    if (!csCase) {
        csCase = possibleCases[Math.floor(Math.random() * possibleCases.length)];
    }

    let reds = 0;
    let pinks = 0;
    let purples = 0;
    let blues = 0;
    let gained = 0;
    let rolls = 0;

    while(true) {
        rolls++;

        let possibleSkins;
        let gold = false;

        const rng = Math.random();

        if (rng >= 0.9974){
            // Gold
            possibleSkins = cases[csCase]['gold'];
            gold = true;
        } else if (rng >= 0.9936) {
            // Red
            possibleSkins = cases[csCase]['red'];
            reds++;
        } else if (rng >= 0.968) {
            // Pink
            possibleSkins = cases[csCase]['pink'];
            pinks++;
        } else if (rng >= 0.8402) {
            // Purple
            possibleSkins = cases[csCase]['purple'];
            purples++;
        } else {
            // Blue
            possibleSkins = cases[csCase]['blue'];
            blues++;
        }

        const skin = possibleSkins[Math.floor(Math.random() * possibleSkins.length)];

        if (!skin) {
            await messageOwner(interaction.client, { content: "Skin is undefined for case " + csCase });
            continue;
        }

        let stattrak = false;

        if (!Object.hasOwn(skin, 'stattrak')) {
            await messageOwner(interaction.client, { content: "No StatTrak for skin\n```" +  skin + "\n``` "});
        } else {
            if (skin['stattrak']) {
                const statRng = Math.random();
                if (statRng <= 0.1) {
                    stattrak = true;
                }
            }
        }

        let skinFloat;

        if (skin['maxWear'] === null || skin['minWear'] === null) {
            skinFloat = "N/A";
        } else {
            skinFloat = (Math.random() * (skin['maxWear'] - skin['minWear']) + skin['minWear']).toFixed(6);
        }
        
        const wearStr = getWear(skinFloat);

        if (!wearStr) {
            return;
        }

        let skinPrice;

        if (stattrak) {
            skinPrice = skin['pricing']['StatTrak ' + wearStr];
        } else {
            skinPrice = skin['pricing'][wearStr];
        }

        if (skinPrice === null) {
            skinPrice = "No recent price data";
        } else {
            gained += skinPrice;
        }

        

        if (gold) {
            const spentCases = rolls * cases[csCase]['price'];
            const spentKeys = rolls * 2.5;
            const color = getRarityHex(skin['rarity']);
            let finalName = skin['name'];
            if (stattrak) {
                finalName = "StatTrak " + finalName;
            }

            let profitString;

            if (gained - spentCases - spentKeys > 0) {
                profitString = '$' + (gained - spentCases - spentKeys).toFixed(2);
            } else {
                profitString = '-$' + ((gained - spentCases - spentKeys) * -1).toFixed(2);
            }

            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(finalName)
                .setThumbnail(skin['img'])
                .addFields(
                    { name: "Exterior", value: wearStr },
                    { name: "Price", value: '$' + skinPrice },
                    { name: "Float", value: skinFloat },
                    { name: "Total rolls", value: rolls.toString() },
                    { name: "Blues", value: blues.toString(), inline: true },
                    { name: "Purples", value: purples.toString(), inline: true },
                    { name: "Pinks", value: pinks.toString(), inline: true },
                    { name: "Reds", value: reds.toString(), inline: true },
                    { name: "Total spent on keys", value: '$' + spentKeys.toFixed(2), inline: true },
                    { name: "Total spent on cases", value: '$' + spentCases.toFixed(2), inline: true },
                    { name: "Total spent", value: '$' + (spentCases + spentKeys).toFixed(2), inline: true },
                    { name: "Profit", value: profitString, inline: true }
                )

            await interaction.editReply({ embeds: [embed] });
            break;
        }
    }
}
