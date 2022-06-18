import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../types/command';
import { searchAlko } from '../managers/alko';

const Alko: SlashCommand = {
  data: {
    name: 'alko',
    description: 'Alkoholisoitunut haku',
    options: [
      {
        type: 'STRING',
        name: 'hakusana',
        description: 'Mitä haetaan?',
        required: true,
      },
    ],
  },
  async execute(interaction: CommandInteraction) {
    if (interaction.user.id === '286963674990772226') {
      await interaction.reply(
        'VAIN TÄYSIKÄISILLE EI SINUNKALTAISILLE VAUVOILLE'
      );

      return;
    }

    await interaction.deferReply();

    const hakusana = interaction.options.getString('hakusana')!;
    const results = await searchAlko(hakusana, 3);
    if (!results[0]) {
      await interaction.editReply({
        content: 'Ei löytynyt mitään :(',
      });

      return;
    }

    const tulokset = results.map((tulos) => {
      return {
        name: tulos.name,
        value: `[${tulos.price}€ ${tulos.abv}% ${tulos.volume}l](https://www.alko.fi/tuotteet/${tulos.id}/)`,
      };
    });

    const embed = new MessageEmbed()
      .setTitle(
        interaction.user.id === '709644495351840779'
          ? 'Lähdetkö etenemään lehto?'
          : 'Alkoholisoitunut haku?'
      )
      .setDescription(
        interaction.user.id === '375364468634550273'
          ? 'Bääbää työstresihuolet painaa pahasti päälle niin pitää päästä juomaan'
          : `Sieltä hakusanalle ${hakusana} tuloksia`
      )
      .addFields(tulokset)
      .setTimestamp()
      .setFooter({ text: 'Onni Lehto © Tuotantoa' })
      .setColor('#e13641')
      .setThumbnail(
        `https://images.alko.fi/t_digipruuvi,f_auto/cdn/${results[0].id}`
      );

    await interaction.editReply({ embeds: [embed] });
  },
};

export default Alko;
