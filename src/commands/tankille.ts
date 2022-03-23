import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../types/command';
import { Tankille } from '../managers/tankille';

const TankilleCommand: SlashCommand = {
  data: {
    name: 'tankille',
    description: 'Tankkaus setit',
  },
  async execute(interaction: CommandInteraction) {
    const api = Tankille.getInstance();
    const data = await api.getGasPrices().catch((err) => {
      console.log('joku meni paskaksi');
    });

    if (!data) return console.log('?');

    const kiisselit = data.filter((value) => {
      if (!value.price[0]) return false;
      return value.fuels.includes('dsl');
    });

    const ysiviis = data.filter((value) => {
      if (!value.price[0]) return false;
      return value.fuels.includes('95');
    });

    const ysiviitoset = ysiviis.sort((a, b) => {
      const kiisseliObj = a.price.filter((fuel) => fuel.tag === '95')[0];
      const kiisseliObjB = b.price.filter((fuel) => fuel.tag === '95')[0];
      return kiisseliObj.price - kiisseliObjB.price;
    });

    const kiisseli = kiisselit.sort((a, b) => {
      const kiisseliObj = a.price.filter((fuel) => fuel.tag === 'dsl')[0];
      const kiisseliObjB = b.price.filter((fuel) => fuel.tag === 'dsl')[0];
      return kiisseliObj.price - kiisseliObjB.price;
    });

    const list = kiisseli.map((track, index) => {
      const kiisseliHinta = track.price.filter((fuel) => fuel.tag === 'dsl')[0];
      return {
        name: `${track.name}`,
        value: `Kiisseli: ${kiisseliHinta.price}€`,
        inline: true,
      };
    });

    const finalList = list.filter((a, i) => i < 3);

    const lopullinenList = [];

    ysiviitoset.forEach((bensa) => {
      const ysiviisHinta = bensa.price.filter((fuel) => fuel.tag === '95')[0];
      lopullinenList.push({
        name: `${bensa.name}`,
        value: `95: ${ysiviisHinta.price}€`,
        inline: true,
      });
    });

    const list1 = lopullinenList.filter((a, i) => i < 3);

    const listaaaa = [...list1, ...finalList];

    const embed = new MessageEmbed()
      .setTitle('Haluatko tankata edullisesti? Onnea.')
      .addFields(listaaaa);
    await interaction.reply({ embeds: [embed] });
  },
};

export default TankilleCommand;
