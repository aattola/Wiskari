import {SlashCommandBuilder} from '@discordjs/builders';
import {CommandInteraction} from 'discord.js';
import getUrls from 'get-urls';
import {crc32} from 'crc';
import BlockGif from '../blockGif';

const Poistablock = {
  data: {
    name: 'poistablock',
  },
  async execute(interaction: CommandInteraction): Promise<void> {
    await BlockGif.removeBlock(interaction);
    // if (!checkForPerms(interaction.user.id)) {
    //   return interaction.reply({
    //     content: 'Et ole pääjehu niin et koske tähän',
    //     ephemeral: true,
    //   });
    // }
    // const { value } = interaction.options.get('hash');
    //
    // const urls = getUrls(value);
    // const urlArray = [...urls];
    //
    // if (urlArray[0]) {
    //   for (const url of urlArray) {
    //     const urlHashed = crc32(url).toString(16);
    //
    //     await db
    //       .collection('estolista2000')
    //       .doc(urlHashed)
    //       .delete()
    //       .catch((err) => {
    //         interaction.reply({
    //           content: `En menestynyt poistossa en tiiä miksi. Hash: ${urlHashed}`,
    //           ephemeral: true,
    //         });
    //       });
    //
    //     interaction.reply({
    //       content: `Menestyin hashin ${urlHashed} poistossa. Refreshaan cachen vielä`,
    //       ephemeral: true,
    //     });
    //
    //     fetchBlocklist();
    //   }
    // } else {
    //   await db
    //     .collection('estolista2000')
    //     .doc(value)
    //     .delete()
    //     .catch((err) => {
    //       interaction.reply({
    //         content: `En menestynyt poistossa en tiiä miksi. Hash: ${value}`,
    //         ephemeral: true,
    //       });
    //     });
    //
    //   await interaction.reply({
    //     content: `Menestyin hashin ${value} poistossa. Refreshaan cachen vielä`,
    //     ephemeral: true,
    //   });
    //
    //   fetchBlocklist();
    // }
  },
};

export default Poistablock;
