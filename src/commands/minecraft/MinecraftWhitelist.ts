import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, Message, MessageReaction, TextChannel } from 'discord.js';
import { Rcon } from 'rcon-client';

const filter = (reaction: MessageReaction) => {
	return reaction.emoji.name === '✅' || reaction.emoji.name === '❌';
};

async function whitelist(username: string, interaction: CommandInteraction) {
  const followUp = await interaction.followUp({ content: `Whitelisting **${username}**...`, fetchReply: true });
  const rcon = await Rcon.connect({
    // @ts-ignore
    host: interaction.client.config.minecraft.serverIP,
    // @ts-ignore
    port: interaction.client.config.minecraft.rconPort,
    // @ts-ignore
    password: interaction.client.config.minecraft.rconPassword,
  });
  const result = await rcon.send(`whitelist add ${username}`);
  await rcon.end();
  if (followUp instanceof Message) {
    await followUp.edit({ content: `Whitelisted **${username}**. Result: \`${result}\`` });
  }
}

export const data = new SlashCommandBuilder()
  .setName('whitelist')
  .setDescription('Whitelist the user in Minecraft, given that the vote passes.')
  .addStringOption((option) => option.setName('username')
    .setDescription('The username to whitelist.')
    .setRequired(true));

export async function execute(interaction: CommandInteraction): Promise<void> {
  if (!interaction.guildId || !(interaction.member instanceof GuildMember)
|| !(interaction.channel instanceof TextChannel)) {
    await interaction.reply({ content: 'You can\'t use that command here.', ephemeral: true });
  }

  const username = interaction.options.getString('username');

  if (interaction.client.config.minecraft === null) {
    await interaction.reply({ content: 'Minecraft is not configured.', ephemeral: true });
    return;
  }

  if (!username) {
    await interaction.reply({ content: 'You must provide a username.', ephemeral: true });
    return;
  }

  if (username.length > 16) {
    await interaction.reply({ content: 'That username is too long.', ephemeral: true });
    return;
  }

  if (interaction.user.id === interaction.client.config.ownerID) {
    await interaction.deferReply();
    await whitelist(username, interaction);
    return;
  }

  const vote = await interaction.reply({ content: `Whitelist **${username}**? At least 5 "yes" votes must be cast within 60 seconds.`, ephemeral: false, fetchReply: true });
  if (vote instanceof Message) {
    let yes = 0;
    let no = 0;
    
    const collector = vote.createReactionCollector({ filter, time: 60000 });
    collector.on('collect', async (reaction: MessageReaction) => {
      if (reaction.emoji.name === '✅') {
        yes++;
      }
      else if (reaction.emoji.name === '❌') {
        no++;
      }
    });

    collector.on('dispose', async (reaction) => {
      if (reaction.emoji.name === '✅') {
        yes--;
      }
      else if (reaction.emoji.name === '❌') {
        no--;
      }
    });

    await vote.react('✅');
    await vote.react('❌');

    collector.on('end', async () => {
      if (yes > 5 && yes > no) {
        await whitelist(username, interaction);
      } else {
        await interaction.editReply({ content: `Not enough yes votes. Yes: ${yes} No: ${no}` });
      }
    
    });
  } else {
    await interaction.editReply({ content: 'Something went wrong.' });
  }
}