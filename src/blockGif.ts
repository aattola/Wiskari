import firebase from 'firebase-admin';
import {
  CommandInteraction,
  ContextMenuInteraction,
  Message,
} from 'discord.js';
import getUrls from 'extract-urls';
import { crc32 } from 'crc';
import { Sentry } from './logging/sentry';

const data = process.env.firebase;
const buff = Buffer.from(data, 'base64');
const text = buff.toString('ascii');

// @ts-ignore eslint-disable-next-line node/no-unpublished-import
// eslint-disable-next-line node/no-unpublished-import
const serviceAccount = JSON.parse(text);

firebase.initializeApp({
  credential: firebase.credential.cert(<any>serviceAccount),
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

  static permissions: string[] = [
    '214760917810937856', // leevi
    '270236553865854982', // jerry
    '229510730099982339', // jarkko
    '375364468634550273', // risto
    '230289238455746560', // topias
  ];

  static checkMessage(message: Message): void {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.thread) return;
    const urls = getUrls(message.content);
    if (!urls) {
      return;
    }
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

  static block(
    interaction: CommandInteraction | ContextMenuInteraction
  ): Promise<void> {
    if (!this.checkForPerms(interaction.user.id)) {
      return interaction.reply({
        content: 'Et ole pääjehu niin et koske tähän',
        ephemeral: true,
      });
    }

    const value = interaction.options.get('message');
    const message = <Message>value.message;
    const urls = getUrls(message.content);
    if (!urls) {
      return interaction.reply({
        content: `Kusetit mua eihän tossa ole edes linkkiä (käytännössä pystyt blokkaamaan linkkejä)`,
        ephemeral: true,
      });
    }
    const urlArray = [...urls];
    if (message.author.bot) {
      return interaction.reply({
        content: `Lopeta tommonen et blokkaa botin juttuja`,
        ephemeral: true,
      });
    }

    urlArray.forEach(async (url) => {
      const urlHashed = crc32(url).toString(16);

      if (urlHashed === '39ae290f')
        return interaction.reply({
          content: `Tämä gif on ei blokki blokkauksen blokkilistalla joten et voi blokata sitä. Niin se menee.`,
          ephemeral: true,
        });

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
        ephemeral: true,
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
    if (!urls) {
      return interaction.reply({
        content: `Kusetit mua eihän tossa ole edes linkkiä`,
        ephemeral: true,
      });
    }
    const urlArray = [...urls];

    if (urlArray[0]) {
      for (const url of urlArray) {
        const urlHashed = crc32(url).toString(16);

        await db
          .collection('estolista2000')
          .doc(urlHashed)
          .delete()
          .catch((err) => {
            Sentry.captureException(err);
            interaction.reply({
              content: `En menestynyt poistossa en tiiä miksi. Kysy leeviltä tai jtn. Hash: ${urlHashed}`,
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
