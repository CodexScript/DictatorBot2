import { ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { ButtonStyle, ChatInputCommandInteraction, ActionRowBuilder } from 'discord.js';
import fs from 'node:fs';
import { messageOwner } from '../../util/AdminUtils.js';
import { ScrapedSkin, CounterStrikeSkin } from '../../models/CounterStrikeSkin.js';

const casesFile = fs.readFileSync('./assets/skins.json', 'utf-8');
const cases = JSON.parse(casesFile);

function getWear(floatValue: any) {
    if (!floatValue || floatValue === "N/A") {
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

function downgradeByOne(floatValue: number) {
    console.log("Downgrading, received float " + floatValue);
    let returnValue;
    if (floatValue >= 0.00 && floatValue <= 0.07) {
        // Minimal Wear range: 0.07 < x <= 0.15
        returnValue = Math.random() * (0.15 - 0.08) + 0.08;
    } else if (floatValue > 0.07 && floatValue <= 0.15) {
        // Field-Tested range: 0.15 < x <= 0.38
        returnValue = Math.random() * (0.38 - 0.16) + 0.16;
    } else if (floatValue > 0.15 && floatValue <= 0.38) {
        // Well-Worn range: 0.38 < x <= 0.45
        returnValue = Math.random() * (0.45 - 0.39) + 0.39;
    } else if (floatValue > 0.38 && floatValue <= 0.45) {
        // Battle-Scarred range: 0.45 < x <= 1.00
        returnValue = Math.random() * (1.00 - 0.46) + 0.46;
    } else {
        // Loop back to fac new
        returnValue = Math.random() * 0.07;
    }

    returnValue = returnValue;

    console.log("Returning " + returnValue);
    return returnValue;
}

async function getSkinInfo(skin: ScrapedSkin, interaction: ChatInputCommandInteraction): Promise<CounterStrikeSkin | null> {
    let stattrak = false;

    if (skin.stattrak) {
        const statRng = Math.random();
        if (statRng <= 0.1) {
            stattrak = true;
        }
    }

    let skinFloat: null | number;

    if (skin.maxWear === null || skin.minWear === null) {
        skinFloat = null;
    } else {
        skinFloat = (Math.random() * (skin.maxWear - skin.minWear) + skin.minWear);
    }
    
    let wearStr;

    let skinPrice;

    let downgrades = 0;

    do {
        if (skinPrice === null && skinFloat) {
            skinFloat = downgradeByOne(skinFloat);
            downgrades++;
        }
        
        wearStr = getWear(skinFloat);

        if (!wearStr) {
            await messageOwner(interaction.client, { content: "Skin " +  skin['name'] + " has no wear string for float " + skinFloat});
            return null;
        }

        if (stattrak) {
            skinPrice = skin['pricing']['StatTrak ' + wearStr];
        } else {
            skinPrice = skin['pricing'][wearStr];
        }    
    } while (skinPrice === null && downgrades < 6);

    if (skinPrice === null) {
        // Entire skin is nulled, reroll
        return null;
    }

    return {
        name: skin.name,
        stattrak: stattrak,
        floatValue: skinFloat,
        wear: wearStr,
        price: skinPrice,
        rarity: skin.rarity
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
    if (choices.length === 25) {
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
    
    const rolledSkins: {
        Blue: { [key: string]: number },
        Purple: { [key: string]: number },
        Pink: { [key: string]: number },
        Red: { [key: string]: number },
        Gold: { [key: string]: number }
    } = {
        Blue: {},
        Purple: {},
        Pink: {},
        Red: {},
        Gold: {}
    };

    let gained = 0;
    let rolls = 0;

    while(true) {

        let possibleSkins;
        let gold = false;
        let rolledRarity: 'gold' | 'red' | 'pink' | 'purple' | 'blue';

        const rng = Math.random();

        if (rng >= 0.9974){
            // Gold
            rolledRarity = 'gold';
        } else if (rng >= 0.9936) {
            // Red
            rolledRarity = 'red';
        } else if (rng >= 0.968) {
            // Pink
            rolledRarity = 'pink';
        } else if (rng >= 0.8402) {
            // Purple
            rolledRarity = 'purple';
        } else {
            // Blue
            rolledRarity = 'blue';
        }

        possibleSkins = cases[csCase][rolledRarity];

        const skin = possibleSkins[Math.floor(Math.random() * possibleSkins.length)] as ScrapedSkin;

        const csSkin = await getSkinInfo(skin, interaction);

        if (!csSkin) {
            continue;
        }

        rolls++;

        if (rolledRarity === 'gold') {
            gold = true;
        }

        let finalName = csSkin.name;
        if (csSkin.stattrak) {
            finalName = "StatTrak\u00AE " + finalName;
        }

        if (Object.hasOwn(rolledSkins[csSkin.rarity], finalName)) {
            rolledSkins[csSkin.rarity][finalName]++;
        } else {
            rolledSkins[csSkin.rarity][finalName] = 1;
        }

        gained += csSkin.price;

        if (gold) {
            const spentCases = rolls * cases[csCase]['price'];
            const spentKeys = rolls * 2.5;
            const color = getRarityHex(csSkin.rarity);

            let profitString;

            if (gained - spentCases - spentKeys > 0) {
                profitString = '$' + (gained - spentCases - spentKeys).toFixed(2);
            } else {
                profitString = '-$' + ((gained - spentCases - spentKeys) * -1).toFixed(2);
            }

            let floatString;

            if (!csSkin.floatValue) {
                floatString = "N/A";
            } else {
                floatString = csSkin.floatValue.toFixed(6);
            }



            const embed = new EmbedBuilder()
                .setColor(color)
                .setTitle(finalName)
                .setThumbnail(skin.img)
                .addFields(
                    { name: "Exterior", value: csSkin.wear },
                    { name: "Price", value: '$' + csSkin.price },
                    { name: "Float", value: floatString },
                    { name: "Total rolls", value: rolls.toString() },
                    { name: "Blues", value: Object.values(rolledSkins['Blue']).reduce((sum, value) => sum + value, 0).toString(), inline: true },
                    { name: "Purples", value: Object.values(rolledSkins['Purple']).reduce((sum, value) => sum + value, 0).toString(), inline: true },
                    { name: "Pinks", value: Object.values(rolledSkins['Pink']).reduce((sum, value) => sum + value, 0).toString(), inline: true },
                    { name: "Reds", value: Object.values(rolledSkins['Red']).reduce((sum, value) => sum + value, 0).toString(), inline: true },
                    { name: "Total spent on keys", value: '$' + spentKeys.toFixed(2), inline: true },
                    { name: "Total spent on cases", value: '$' + spentCases.toFixed(2), inline: true },
                    { name: "Total spent", value: '$' + (spentCases + spentKeys).toFixed(2), inline: true },
                    { name: "Profit", value: profitString, inline: true }
                )

            const viewAll = new ButtonBuilder()
                .setCustomId('see_all_skins')
                .setLabel('See all skins opened')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(viewAll);

            const response = await interaction.editReply({ embeds: [embed], components: [row] });

            try {
                const confirmation = await response.awaitMessageComponent({ time: 60_000 });
            
                if (confirmation.customId === 'see_all_skins') {
                    let allSkins = '```\nBlues:\n';

                    for (let blue of Object.keys(rolledSkins['Blue'])) {
                        allSkins += `\t${rolledSkins['Blue'][blue]}x ${blue}\n`;
                    }

                    allSkins += 'Purples:\n';

                    for (let purple of Object.keys(rolledSkins['Purple'])) {
                        allSkins += `\t${rolledSkins['Purple'][purple]}x ${purple}\n`;
                    }

                    allSkins += 'Pinks:\n';

                    for (let pink of Object.keys(rolledSkins['Pink'])) {
                        allSkins += `\t${rolledSkins['Pink'][pink]}x ${pink}\n`;
                    }

                    allSkins += 'Reds:\n';

                    for (let red of Object.keys(rolledSkins['Red'])) {
                        allSkins += `\t${rolledSkins['Red'][red]}x ${red}\n`;
                    }

                    allSkins += 'Golds:\n';

                    for (let gold of Object.keys(rolledSkins['Gold'])) {
                        allSkins += `\t${rolledSkins['Gold'][gold]}x ${gold}\n`;
                    }

                    allSkins += '```';

                    await confirmation.update({ embeds: [embed], components: [], content: allSkins });
                }
            } catch (e) {
                await response.edit({ embeds: [embed], components: [] });
            }

            break;
        }
    }
}
