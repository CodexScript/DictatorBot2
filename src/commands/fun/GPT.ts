import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
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
    .setDescription('The higher the number, the more random the sentence will be. 0-1. Default 1.')
    .setMinValue(0)
    .setMaxValue(1)
    .setRequired(false));

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.client.config.openaiToken) {
    await interaction.reply({ content: 'OpenAI has not been set up by the bot owner.', ephemeral: true });
    return;
  }
  await interaction.deferReply();

  const prompt = interaction.options.getString('prompt');
  const model = interaction.options.getString('model') || 'text-davinci-002';
  const temperature = interaction.options.getNumber('randomness') || 1;

  const response = await got.post(`https://api.openai.com/v1/engines/${model}/completions`, {
    throwHttpErrors: false,
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${interaction.client.config.openaiToken}`,
    },
    json: {
      prompt,
      temperature,
      n: 1,
      top_p: 1,
      stream: false,
      logprobs: 0,
      max_tokens: 500
    }
  });

  if (response.statusCode !== 200) {
    await interaction.followUp({ content: `Something went wrong:\n${response.statusCode}: ${response.statusMessage}` });
    return;
  }

  const respData = response.body as GPTResponse;

  await interaction.followUp({ content: `**${prompt}** ${respData.choices[0].text}` });
}
