import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { SlashCommand } from '../types/command';
import { client } from '../index';

const Deploy: SlashCommand = {
  data: {
    name: 'deploy',
    description: 'DEV',
    defaultPermission: false,
  },
  permissions: [
    {
      id: '214760917810937856',
      type: 'USER',
      permission: true,
    },
  ],
  async execute(interaction: CommandInteraction) {
    if (!interaction.guild) return console.log('ei guild1');
    const guildi = client.guilds.cache.get(interaction.guild.id);

    await guildi?.commands.create({
      name: 'Lisää blokkilistalle',
      type: 'MESSAGE',
      defaultPermission: true,
    });
    await interaction.reply({
      content: 'Vammaista menoa ukko',
      ephemeral: true,
    });
  },
};

export default Deploy;
