import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { formatCurrency, getBalance } from '../../util/BalanceUtil.js';


export const data = new SlashCommandBuilder().setName('bal')
    .setDescription('Shows your current balance.')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('The user to check the balance for. Defaults to you.')
            .setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    let target = interaction.options.getUser('user');

    if (!target) {
        target = interaction.user;
    }

    const result = await getBalance(interaction.client.sql, target.id);

    if (target) {
        await interaction.reply({ content: `${target.displayName} balance: **${formatCurrency(result.balance_cents / 100)}**\nMost gained in one run: **${formatCurrency(result.most_gained / 100)}**\nMost lost in one run: **${formatCurrency(result.most_lost / 100)}**`, ephemeral: true });
    } else {
        await interaction.reply({ content: `Your balance: **${formatCurrency(result.balance_cents / 100)}**\nMost gained in one run: **${formatCurrency(result.most_gained / 100)}**\nMost lost in one run: **${formatCurrency(result.most_lost / 100)}**`, ephemeral: true });
    }
}
