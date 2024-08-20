import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { formatCurrency, getBalance, setBalance } from '../../util/BalanceUtil.js';


export const data = new SlashCommandBuilder().setName('bal').setDescription('Shows your current balance.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const bal = await getBalance(interaction.client.sql, interaction.user.id);

    const balString = formatCurrency(bal / 100);

    await interaction.reply({ content: `Your balance is: **${balString}**`, ephemeral: true });
}
