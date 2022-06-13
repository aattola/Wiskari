import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
  MessageSelectOptionData,
} from 'discord.js';
import { SlashCommand } from '../types/command';
import { Tankille } from '../managers/tankille';
import { Asema } from '../types/tankkiTypes';

const TankilleCommand: SlashCommand = {
  data: {
    name: 'tankille',
    description: 'Tankkaus setit',
  },
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const api = Tankille.getInstance();
    const data = await api.getGasPrices().catch((err) => {
      console.log('joku meni paskaksi', err);
      throw new Error('joku meni rikki');
    });

    if (!data) return console.log('?', data);

    const kiisselit = data.filter((value) => {
      if (!value.price[0]) return false;
      // vitun klopit ei laita diisselin hintoja vaikka kiisselin hinta löytyisi
      const diisselihinta = value.price.filter((a) => a.tag === 'dsl');
      if (!diisselihinta[0]) return false;
      return value.fuels.includes('dsl');
    });

    const ysiviis = data.filter((value) => {
      if (!value.price[0]) return false;
      // sama bensalle
      const bensahinta = value.price.filter((a) => a.tag === '95');
      if (!bensahinta[0]) return false;
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

      if (!kiisseliObj || !kiisseliObjB) return 0;
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

    const lopullinenList: any[] = [];
    const ysiviisLista: Asema[] = [];

    ysiviitoset.forEach((bensa) => {
      const ysiviisHinta = bensa.price.filter((fuel) => fuel.tag === '95')[0];
      ysiviisLista.push({
        ...bensa,
      });

      lopullinenList.push({
        name: `${bensa.name}`,
        value: `95: ${ysiviisHinta.price}€`,
        inline: true,
      });
    });

    ysiviisLista[2] = ysiviitoset[ysiviitoset.length - 1];

    const list1 = lopullinenList.filter((a, i) => i < 3);
    const ysiviisListaFiltered = ysiviisLista.filter((a, i) => i < 3);

    // // eslint-disable-next-line prefer-destructuring
    // ysiviisListaFiltered[3] = kiisseli[0];
    // // eslint-disable-next-line prefer-destructuring
    // ysiviisListaFiltered[4] = kiisseli[1];
    // ysiviisListaFiltered[5] = kiisseli[kiisseli.length - 1];

    list1[2] = lopullinenList[lopullinenList.length - 1];
    finalList[2] = list[list.length - 1];

    const listaaaa = [...list1, ...finalList];

    const embed = new MessageEmbed()
      .setTitle('Haluatko tankata edullisesti? Onnea.')
      .setDescription(
        'Tuossa näkyy 95 ja kiisselin hinnat. Ekana kaksi halvinta viimeisenä kallein.'
      )
      .addFields(listaaaa)
      .setTimestamp()
      .setFooter({ text: 'Tankkausbotti - Hinnat päivittyvät 10 min välein' });

    const options: MessageSelectOptionData[] = ysiviisListaFiltered.map(
      (asema) => {
        return {
          label: `${asema.name} - 95`,
          description: `${asema.address.street}`,
          value: `${asema._id}`,
        };
      }
    );

    // const row1 = new MessageActionRow().addComponents(
    //   new MessageButton()
    //     .setCustomId('listGas')
    //     .setLabel('Näytä koko lista')
    //     .setStyle('SECONDARY')
    // );

    const row2 = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId('bensa-asema')
        .setPlaceholder('Mielenkiintoista, kerro lisää.')
        .addOptions([
          ...options,
          {
            label: 'Huijauskoodi irl',
            description: 'Tapa jolla säästät rahaa',
            value: 'olenkoyha',
          },
        ])
    );

    await interaction
      .editReply({ embeds: [embed], components: [row2] })
      .catch((err) => console.log(err));
  },
};

export default TankilleCommand;
