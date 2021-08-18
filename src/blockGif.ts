import firebase from 'firebase-admin';
import { CommandInteraction, Message } from 'discord.js';
import getUrls from 'get-urls';
import { crc32 } from 'crc';

// eslint-disable-next-line import/no-unresolved,node/no-unpublished-require,@typescript-eslint/no-var-requires
const serviceAccount = require('../firebase.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://sleier-b857e.firebaseio.com',
});

const db = firebase.firestore();

interface Blocked {
  poster: {
    id: string;
    name: string;
  };
  timestamp: number;
  url: string;
}

class BlockGif {
  static blocked: Blocked[] = [];

  static permissions: string[] = ['214760917810937856'];

  static checkMessage(message: Message): void {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.thread) return;
    const urls = getUrls(message.content);
    const urlArray = [...urls];

    urlArray.forEach(async (url) => {
      for (const blocked1 of this.blocked) {
        if (blocked1.url === url) {
          message.delete().catch(() => null);

          const dmChan = await message.author.createDM().catch(() => null);

          dmChan
            .send(`Tuo on estetty joten älä laita tällästä`)
            .catch(() => null);
        }
      }
    });
  }

  static block(interaction: CommandInteraction): Promise<void> {
    if (!this.checkForPerms(interaction.user.id)) {
      return interaction.reply({
        content: 'Et ole pääjehu niin et koske tähän',
        ephemeral: true,
      });
    }

    const value = interaction.options.get('message');
    const message = <Message>value.message;
    const urls = getUrls(message.content);
    const urlArray = [...urls];
    if (message.author.bot) {
      return interaction.reply({
        content: `Lopeta tommonen et blokkaa botin juttuja`,
        ephemeral: true,
      });
    }

    urlArray.forEach(async (url) => {
      const urlHashed = crc32(url).toString(16);
      await db
        .collection('estolista2000')
        .doc(urlHashed)
        .set({
          url,
          poster: {
            name: message.author.username,
            id: message.author.id,
          },
          timestamp: Date.now(),
        });
    });

    if (urlArray[0]) {
      this.fetchBlocklist().then(() => null);

      return interaction.reply({
        content: `Ihan ok mut [toi](${message.url}) meni estolistalle`,
      });
    }
    return interaction.reply({
      content: `Kusetit mua eihän tossa ole edes linkkiä`,
      ephemeral: true,
    });
  }

  static async removeBlock(
    interaction: CommandInteraction
  ): Promise<boolean | void> {
    if (!this.checkForPerms(interaction.user.id)) {
      return interaction.reply({
        content: 'Et ole pääjehu niin et koske tähän',
        ephemeral: true,
      });
    }
    const { value } = interaction.options.get('hash');

    const urls = getUrls(<string>value);
    const urlArray = [...urls];

    if (urlArray[0]) {
      for (const url of urlArray) {
        const urlHashed = crc32(url).toString(16);

        await db
          .collection('estolista2000')
          .doc(urlHashed)
          .delete()
          .catch(() => {
            interaction.reply({
              content: `En menestynyt poistossa en tiiä miksi. Hash: ${urlHashed}`,
              ephemeral: true,
            });
          });

        await interaction.reply({
          content: `Menestyin hashin ${urlHashed} poistossa. Refreshaan cachen vielä`,
          ephemeral: true,
        });

        await this.fetchBlocklist();
      }
    } else {
      await db
        .collection('estolista2000')
        .doc(<string>value)
        .delete()
        .catch(() => {
          interaction.reply({
            content: `En menestynyt poistossa en tiiä miksi. Hash: ${value}`,
            ephemeral: true,
          });
        });

      await interaction.reply({
        content: `Menestyin hashin ${value} poistossa. Refreshaan cachen vielä`,
        ephemeral: true,
      });

      await this.fetchBlocklist();
    }

    return true;
  }

  static async fetchBlocklist(): Promise<Blocked[]> {
    const estoTesto = db.collection('estolista2000');
    const snapshot = await estoTesto.get();

    const blockedArray = [];
    snapshot.forEach((doc) => {
      const docci = doc.data();
      blockedArray.push(<Blocked>docci);
    });

    this.blocked = blockedArray;

    return this.blocked;
  }

  static checkForPerms(id: string): boolean {
    return this.permissions.includes(id);
  }
}

export default BlockGif;
