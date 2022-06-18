import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../types/command';
import { getAlkoStock } from '../managers/alko';

const Viina: SlashCommand = {
  data: {
    name: 'viina',
    description: 'Alkoholisti?',
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    const stock = await getAlkoStock();

    const storesInKangasala = stock.filter((store) => {
      if (store.store.city === 'Kangasala') {
        return store;
      }
    });

    if (!storesInKangasala[0]) {
      await interaction.editReply('ei löydy kangasalta :(((((');
      return;
    }

    const list = storesInKangasala!.map((kauppa) => {
      return {
        name: kauppa.store.name,
        value: `Jopa **${kauppa!.count}** kpl!`,
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
          : `Sieltä kangasalan alueelta viinaa virkeille ihmisille`
      )
      .addFields(list)
      .setTimestamp()
      .setFooter({ text: 'Onni Lehto © Tuotantoa' })
      .setColor('#e13641')
      .setThumbnail(`https://images.alko.fi/t_digipruuvi,f_auto/cdn/929092`);

    await interaction.editReply({ embeds: [embed] });
  },
};

export default Viina;
