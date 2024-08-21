import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { formatCurrency, getBalance, setBalance } from '../../util/BalanceUtil.js';


export const data = new SlashCommandBuilder().setName('bal').setDescription('Shows your current balance.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const result = await getBalance(interaction.client.sql, interaction.user.id);

    await interaction.reply({ content: `Your balance: **${formatCurrency(result.balance_cents / 100)}**\nMost gained in one run: **${formatCurrency(result.most_gained / 100)}**\nMost lost in one run: **${formatCurrency(result.most_lost / 100)}**`, ephemeral: true });
}
