import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('socialcredit')
        .setDescription('Tells you the social credit of the specified user.')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to check the social credit of.')
            .setRequired(false)),
    async execute(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();

        const user = interaction.options.getMember('user');

        let targetUser = interaction.member;
        if (user instanceof GuildMember) {
            targetUser = user;
        }

        

    }
}