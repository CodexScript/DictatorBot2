import { SlashCommandBuilder } from '@discordjs/builders';
import { ActivityType, CommandInteraction, GuildMember } from 'discord.js';

type TriggerFunction = (interaction: CommandInteraction) => Promise<boolean>;

let counter = 0;

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function gameTrigger(interaction: CommandInteraction) {
    if (!(interaction.member instanceof GuildMember)) {
        return false;
    }

    const activities = interaction.member.presence?.activities;

    if (!activities) {
        return false;
    }

    if (
        interaction.member.presence?.activities?.length === undefined ||
        interaction.member.presence.activities.length === 0
    ) {
        return false;
    }

    const current = activities[0];

    if (current.type !== ActivityType.Playing) {
        return false;
    }

    await interaction.reply(`*unprompted* ${current.name} is probably the worst game in terms of art and design`);
    return true;
}

async function wrTrigger(interaction: CommandInteraction) {
    await interaction.reply({ files: ['./assets/wr_mc_speedrun.mp4'] });
    return true;
}

const responses: Array<string | TriggerFunction> = [
    'I disagree',
    "OK, here's the schpiel... *incoherent rambling*",
    'Nigger',
    'Long dick style',
    "It's time for the twerkulator",
    "Well no it's like the whole schpiel",
    'Wait no but like unironically...',
    'OK nerd',
    '*unprompted* CS:GO is the best shooter of all time',
    '*whines about back pain*',
    'I feel no remorse watching an animal die at my hand',
    "You can't understand art because you're not trained in it.",
    'Die',
    '*watches child porn*',
    "I'm not the CP guy STOP",
    'You are wrong, I am correct',
    '*watches gross fetish porn*',
    "AI can't create art, I swear I'll still be employed in five years guys",
    'I signed an NDA',
    "I don't think there is any talent in being a good actor",
    "The average person can't tell the difference between 30 and 60 FPS.",
    wrTrigger,
    gameTrigger,
];

shuffleArray(responses);

export const data = new SlashCommandBuilder()
    .setName('payton')
    .setDescription('A Magic 8-ball but with responses like Payton.');

export async function execute(interaction: CommandInteraction): Promise<void> {
    let success = false;

    while (!success) {
        const response = responses[counter];
        if (response instanceof Function) {
            success = await response(interaction);
        } else {
            await interaction.reply(response);
            success = true;
        }
        counter++;
        if (counter >= responses.length) {
            counter = 0;
        }
    }
}
