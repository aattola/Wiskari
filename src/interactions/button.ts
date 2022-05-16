import { SlashCommandBuilder } from '@discordjs/builders';
import {
  ButtonInteraction,
  Message,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
} from 'discord.js';
import { TictacManager } from '../tictac';
import { rivi1, rivi2 } from '../stuff/kanaComponents';
import { Tankille } from '../managers/tankille';

const Button = {
  data: new SlashCommandBuilder().setName('button').setDescription('huutinen'),
  async execute(interaction: ButtonInteraction) {
    if (interaction.customId === 'listGas') {
      await interaction.deferReply();
      const api = Tankille.getInstance();
      const bensa = await api.getGasPrices();

      const listaaaa = bensa.map((asema) => {
        const ysiviisHinta = asema.price.filter((fuel) => fuel.tag === '95')[0];
        const dieselHinta = asema.price.filter((fuel) => fuel.tag === 'dsl')[0];

        return {
          name: asema.name,
          value: `95: ${
            ysiviisHinta ? ysiviisHinta.price : 'Ei löytynyt'
          } Diesel: ${dieselHinta ? dieselHinta.price : 'Ei löytynyt'}`,
        };
      });

      const embed = new MessageEmbed()
        .setTitle('Haluatko tankata edullisesti? Onnea.')
        .setDescription(
          'Tuossa näkyy 95 ja kiisselin hinnat. Listana tälläkertaa. Ei lajiteltu hinnan mukaan.'
        )
        .addFields(listaaaa)
        .setTimestamp()
        .setFooter({ text: 'Tankkausbotti' });

      interaction.editReply({
        embeds: [embed],
      });

      return;
    }

    if (interaction.customId === 'kanariisi') {
      const message = <Message>interaction.message;
      if (
        message.content
          .toLowerCase()
          .includes(interaction.user.username.toLowerCase())
      ) {
        return interaction.reply({
          ephemeral: true,
          content: 'ÄLÄ SPÄMMI VITUN JUNTTI',
        });
      }

      await interaction.update({
        content: `${message.content}\n${interaction.user.username} on kanariisin puolella!\n`,
        components: [rivi1, rivi2],
      });
      return;
    }

    if (interaction.customId === 'kananuudeli') {
      const message = <Message>interaction.message;
      if (
        message.content
          .toLowerCase()
          .includes(interaction.user.username.toLowerCase())
      ) {
        return interaction.reply({
          ephemeral: true,
          content: 'ÄLÄ SPÄMMI VITUN JUNTTI',
        });
      }
      await interaction.update({
        content: `${message.content}\n${interaction.user.username} on kananuudelin puolella!\n`,
        components: [rivi1, rivi2],
      });
      return;
    }

    if (interaction.customId === 'olenhomo') {
      const message = <Message>interaction.message;
      if (
        message.content
          .toLowerCase()
          .includes(interaction.user.username.toLowerCase())
      ) {
        return interaction.reply({
          ephemeral: true,
          content: 'ÄLÄ SPÄMMI VITUN JUNTTI',
        });
      }
      await interaction.update({
        content: `${message.content}\n${interaction.user.username} on umpihomo!\n`,
        components: [rivi1, rivi2],
      });
      return;
    }

    if (interaction.customId === 'punainennappi') {
      if (
        interaction.user.id === '270236553865854982' ||
        interaction.user.id === '214760917810937857'
      ) {
        const { id } = interaction.user; // jerry tossaja
        const member = await interaction.guild?.members.fetch(id);
        if (!member) return;

        try {
          await member.timeout(10000, 'HÄÄHÄÄÄ');
          await interaction.reply(
            'Kares ampui itseään jalkaan 10% mahdollisuuksilla.'
          );
        } catch (e) {
          await interaction.reply('Rikki meni');
        }

        return;
      }

      interaction.reply({
        ephemeral: true,
        content: 'OLETKOS SINÄ KARES JERRY???????? ETPÄ TAINNUT OLLA KLOPPI',
      });
      return;
    }

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

    await interaction.reply(
      'Hassua Leevi ei lisännyt koodia joka händläisi sinun nappien naputukset'
    );
  },
};

export default Button;
