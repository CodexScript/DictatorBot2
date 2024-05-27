import { SlashCommandBuilder } from '@discordjs/builders';
import { ActivityType, CommandInteraction, GuildMember } from 'discord.js';

type TriggerFunction = () => Promise<boolean>;

const responses: Array<string> = [
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
];

export const data = new SlashCommandBuilder()
    .setName('payton')
    .setDescription('A Magic 8-ball but with responses like Payton.');

export async function execute(interaction: CommandInteraction): Promise<void> {
    const gameTrigger = async () => {
        if (!(interaction.member instanceof GuildMember)) {
            return false;
        }

        const activities = interaction.member.presence?.activities;

        if (!activities) {
            return false;
        }

        const current = activities[0];

        await interaction.reply(`*unprompted* ${current.name} is probably the worst game in terms of art and design`);
        return true;
    };

    const wrTrigger = async () => {
        await interaction.reply({ files: ['./assets/wr_mc_speedrun.mp4'] });
        return true;
    };

    const triggers: Array<TriggerFunction> = [];

    if (interaction.member instanceof GuildMember) {
        if (
            interaction.member.presence?.activities?.length !== undefined &&
            interaction.member.presence.activities.length > 0
        ) {
            console.log(interaction.member.presence);
            if (interaction.member.presence.activities[0].type === ActivityType.Playing) {
                triggers.push(gameTrigger);
            }
        }
    }

    triggers.push(wrTrigger);

    const allResponses = [...responses, ...triggers];

    const response = allResponses[Math.floor(Math.random() * allResponses.length)];
    if (response instanceof Function) {
        const success = await response();
        if (!success) {
            await interaction.reply(responses[Math.floor(Math.random() * responses.length)]);
        }
    } else {
        await interaction.reply(response);
    }
}
