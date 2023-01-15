import { SlashCommandBuilder } from '@discordjs/builders';
import { ActivityType, CommandInteraction, GuildMember } from 'discord.js';
import { playURL } from '../../util/PlayerUtils.js';

const responses: Array<string> = ['I disagree', 'OK, here\'s the schpiel... *incoherent rambling*', 'Based', 'Nigger', 'Big dick style',
  'Zesty.', 'It\'s time for the twerkulator', 'Free Wi-Fi anywhere you go', 'Well no it\'s like the whole schpiel',
  'Wait no but like unironically...', 'Kumalala', 'OK nerd', '*unprompted* CS:GO is the best shooter of all time',
  '*whines about back pain*', 'I feel no remorse watching an animal die at my hand',
  'You can\'t understand art because you\'re not trained in it.', 'Die'];


export const data = new SlashCommandBuilder()
  .setName('payton')
  .setDescription('A Magic 8-ball but with responses like Payton.');

export async function execute(interaction: CommandInteraction): Promise<void> {

  const kumalaTrigger = async() => {
    await playURL(interaction, new URL('https://www.youtube.com/watch?v=aOIPt1TQXZA'))
  };

  const gameTrigger = async() => {
    if (!(interaction.member instanceof GuildMember)) {
      return;
    }

    const activities = interaction.member.presence?.activities;

    if (!activities) {
      return;
    }

    const current = activities[0];

    await interaction.reply(`*unprompted* ${current.name} is probably the worst game in terms of art and design`);

  };
    
  const triggers: Array<Function> = [];

  if (interaction.member instanceof GuildMember) {
    if (interaction.member.presence?.activities?.length !== undefined && interaction.member.presence.activities.length > 0) {
      if (interaction.member.presence.activities[0].type === ActivityType.Playing) {
        triggers.push(gameTrigger);
      }
    }

    if (interaction.member.voice.channel) {
      triggers.push(kumalaTrigger);
    }
  }

  const allResponses = [...responses, ...triggers];

  const response = allResponses[Math.floor(Math.random() * allResponses.length)];
  if (response instanceof Function) {
    await response();
  } else {
    await interaction.reply(response);
  }
}