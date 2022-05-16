import { SlashCommandBuilder } from '@discordjs/builders';
import { Message, SelectMenuInteraction } from 'discord.js';
import { Tankille } from '../managers/tankille';

const Button = {
  data: new SlashCommandBuilder()
    .setName('selectmenu')
    .setDescription('huutinen'),
  async execute(interaction: SelectMenuInteraction) {
    if (interaction.customId === 'bensa-asema') {
      await interaction.deferReply();

      const selection = interaction.values[0];
      if (selection === 'olenkoyha') {
        interaction.editReply({
          content: `<@${interaction.user.id}> Olet köyhä ymmärrän. Pistä pyöräillen HALOOOOO?`,
        });

        return;
      }

      const api = Tankille.getInstance();
      const tiedosto = await api.generateGraph(selection);

      interaction.editReply({
        files: [tiedosto],
      });
      return;
    }

    if (interaction.customId.startsWith('palautevalikko__')) {
      const msgId = interaction.customId.split('__')[1];
      const message = await interaction.channel?.messages.fetch(msgId);
      if (!message) {
        await interaction.update({
          content:
            'Joku meni päin persettä viestiä haettaessa. Moderoiko jerry sen pois? Vai onko leevi paska koodaan?',
          components: [],
        });
        return;
      }

      const valinta = interaction.values[0];
      // homo
      // vammainen
      // rasismi

      let viesti = '';

      if (valinta === 'homo') {
        viesti = `${interaction.user.username} toteaa julkisesti olevansa homo`;
      }

      if (valinta === 'vammainen') {
        viesti = `${interaction.user.username} toteaa olevansa 100% kehitysvammainen. Kysy lisätietoja häneltä!`;
      }

      if (valinta === 'rasismi') {
        viesti = `${interaction.user.username} haluaa kaikkien tietävän että hän on ihan umpirasisti!`;
      }

      if (
        message.content
          .toLowerCase()
          .includes(interaction.user.username.toLowerCase())
      ) {
        return interaction.update({
          content: 'ET TROLLAA tolleen nyt spämmimäl pliis',
          components: [],
        });
      }

      await message.edit({
        content: `${message.content}\n${viesti}\n`,
      });

      await interaction.update({
        content:
          'Palautteesi on vastaanotettu! Palautteesi on tärkeää jotta voimme parantaa Wiskarin palveluita.',
        components: [],
      });

      return;
    }

    await interaction.reply('selectmenu testi');
  },
};

export default Button;
