import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageSelectMenu,
} from 'discord.js';
import { TictacManager } from '../tictac';

const Button = {
  data: new SlashCommandBuilder().setName('button').setDescription('huutinen'),
  async execute(interaction: ButtonInteraction) {
    if (interaction.customId.startsWith('ttt')) {
      const tictac = TictacManager.getInstance();
      await tictac.handleButtonInteraction(interaction);
      return;
    }

    if (interaction.customId === 'palautetta') {
      const message = <Message>interaction.message;
      if (
        message.content
          .toLowerCase()
          .includes(interaction.user.username.toLowerCase())
      ) {
        return interaction.reply({
          ephemeral: true,
          content:
            'Annoit palautteesi jo. Et kai yritä spämmiä tai mitään. (komppaus tai palaute)',
        });
      }

      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId(`palautevalikko__${interaction.message.id}`)
          .setPlaceholder('Valitse palaute sitten')
          .addOptions([
            {
              label: 'Olet homo',
              description: 'homo homo homo homo homo homo homo homo homo',
              value: 'homo',
              emoji: '872819082339155978',
            },
            {
              label: 'Olet vammainen',
              description: 'KeVa jne',
              value: 'vammainen',
              emoji: '667742302789304330',
            },
            {
              label: 'Olet ihonvärin perusteella vähemmistöön kuuluva',
              description: 'Niih tällee ja tollee',
              value: 'rasismi',
              emoji: '872864077842616330',
            },
          ])
      );

      interaction.reply({
        content: 'Anna palautetta sitten:',
        components: [row],
        ephemeral: true,
      });

      return;
    }

    if (interaction.customId === 'komppaan') {
      const message = <Message>interaction.message;
      if (
        message.content
          .toLowerCase()
          .includes(interaction.user.username.toLowerCase())
      ) {
        return interaction.reply({
          ephemeral: true,
          content:
            'ET TROLLAA tolleen nyt pliis (spämmi nimeäs viestiin luuseri)',
        });
      }

      interaction.update({
        content: `${message.content}\n${interaction.user.username} +1\n`,
      });
      return;
    }

    await interaction.reply('testi vammainen !');
  },
};

export default Button;
