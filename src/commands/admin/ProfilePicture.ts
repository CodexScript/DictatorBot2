import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { setPfp } from '../../util/settings/GlobalSettingsManager.js';
import { setProfilePicture } from '../../models/Bot.js';
import { isAdmin } from '../../util/AdminUtils.js';

export const data = new SlashCommandBuilder()
    .setName('pfp')
    .setDescription('Changes the profile picture of the bot.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Sets the profile picture of the bot.')
            .addStringOption((option) =>
                option
                    .setName('url')
                    .setDescription('The URL of the image to set as the profile picture.')
                    .setRequired(true),
            )
            .addBooleanOption((option) =>
                option
                    .setName('force')
                    .setDescription('Whether or not to force the profile picture to be set.')
                    .setRequired(false),
            ),
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('reset').setDescription('Resets the profile picture of the bot.'),
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!isAdmin(interaction.client, interaction.user.id)) {
        await interaction.reply({ content: "You can't use that command.", ephemeral: true });
        return;
    }

    if (
        !interaction.guildId ||
        !(interaction.member instanceof GuildMember) ||
        !(interaction.channel instanceof TextChannel)
    ) {
        await interaction.reply({ content: "You can't use that command here.", ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'set') {
        const url = interaction.options.getString('url');
        let force = interaction.options.getBoolean('force');
        if (!force) {
            force = false;
        }

        if (!url) {
            await interaction.reply({ content: 'You must specify a URL.', ephemeral: true });
            return;
        }
        await setPfp(interaction.client.Bot, url, force);
        await interaction.client.user?.setAvatar(url);
        await interaction.reply({ content: 'Profile picture changed.', ephemeral: true });
    } else if (subcommand === 'reset') {
        await setProfilePicture(interaction.client.Bot, true);
        await interaction.reply({ content: 'Profile picture reset.', ephemeral: true });
    }
}
