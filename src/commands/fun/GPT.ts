import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import got from 'got';
import GPTResponse from '../../models/GPTResponse';

export const data = new SlashCommandBuilder()
  .setName('gpt')
  .setDescription('Prompts GPT-3 to generate a sentence.')
  .addStringOption((option) => option.setName('prompt')
    .setDescription('The prompt to use for GPT-3.')
    .setRequired(true))
  .addStringOption((option) => option.setName('model')
    .setDescription('The model to use.')
    .addChoices([['davinci', 'text-davinci-002'], ['ada', 'text-ada-001'], ['babbage', 'text-babbage-001'], ['curie', 'text-curie-001']])
    .setRequired(false))
  .addNumberOption((option) => option.setName('randomness')
    .setDescription('The higher the number, the more random the sentence will be. 0-1. Default 0.7.')
    .setMinValue(0)
    .setMaxValue(1)
    .setRequired(false))
  .addIntegerOption((option) => option.setName('max_length')
    .setDescription('The maximum length of the sentence. Default 256.')
    .setMinValue(0)
    .setMaxValue(2000)
    .setRequired(false));

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.client.config.openaiToken) {
    await interaction.reply({ content: 'OpenAI has not been set up by the bot owner.', ephemeral: true });
    return;
  }
  await interaction.deferReply();

  const prompt = interaction.options.getString('prompt');
  const model = interaction.options.getString('model') || 'text-davinci-002';
  const temperature = interaction.options.getNumber('randomness') || 0.7;
  const maxLength = interaction.options.getInteger('max_length') || 256;

  const response = await got.post(`https://api.openai.com/v1/engines/${model}/completions`, {
    headers: {
      Authorization: `Bearer ${interaction.client.config.openaiToken}`,
    },
    json: {
      prompt,
      temperature,
      max_length: maxLength,
    }
  }).json() as GPTResponse;

  const embed = new MessageEmbed()
    .setTitle('GPT-3 Response')
    .setDescription(`**${prompt}** ${response.choices[0].text}`)
    .setThumbnail('https://yt3.ggpht.com/a/AGF-l7_v51OdQMsXHr-f0canebdaj0d3NtQmM5nhJA=s900-c-k-c0xffffffff-no-rj-mo');

  await interaction.followUp({ embeds: [embed] });
}
