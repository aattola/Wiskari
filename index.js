/* eslint-disable no-plusplus */
/* eslint-disable no-useless-concat */
require('dotenv').config();
const Discord = require('discord.js');
const {crc32} = require('crc');

const {MessageActionRow, MessageSelectMenu} = Discord;
const fetch = require('node-fetch');
const {Board, RandomChoice, Minimax} = require('tictactoe-game-modules');
const getUrls = require('get-urls');

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_INVITES', 'GUILD_VOICE_STATES'],
});

const firebase = require('firebase-admin');
const serviceAccount = require('./firebase.json');

module.exports = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://sleier-b857e.firebaseio.com',
});

const db = firebase.firestore();
let blockedUrls = [];
const ukotJollaOikeus = ['214760917810937856', '270236553865854982'];
// in interactionCreate

function checkForPerms(id) {
  if (ukotJollaOikeus.includes(id)) return true;
  return false;
}

async function fetchBlocklist() {
  const estoTesto = db.collection('estolista2000');
  const snapshot = await estoTesto.get();

  blockedUrls = [];
  snapshot.forEach((doc) => {
    const docci = doc.data();
    // console.log(doc.id, '=>', docci);

    blockedUrls.push(docci);
  });
}

client.on('messageCreate', async (message) => {
  // console.log(message.author.bot, !message.guild, !message.thread);
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.thread) return;
  const urls = getUrls(message.content);
  const urlArray = [...urls];

  urlArray.forEach(async (url) => {
    blockedUrls.forEach(async (blocked) => {
      if (blocked.url === url) {
        message.delete().catch(() => null);

        const dmChan = await message.author.createDM().catch(() => null);

        dmChan
          .send(`Tuo on estetty joten älä laita tällästä`)
          .catch(() => null);
      }
    });
  });
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === 'poistablock') {
      if (!checkForPerms(interaction.user.id)) {
        return interaction.reply({
          content: 'Et ole pääjehu niin et koske tähän',
          ephemeral: true,
        });
      }
      const {value} = interaction.options.get('hash');

      const urls = getUrls(value);
      const urlArray = [...urls];

      if (urlArray[0]) {
        urlArray.forEach(async (url) => {
          const urlHashed = crc32(url).toString(16);

          await db
            .collection('estolista2000')
            .doc(urlHashed)
            .delete()
            .catch((err) => {
              interaction.reply({
                content: `En menestynyt poistossa en tiiä miksi. Hash: ${urlHashed}`,
                ephemeral: true,
              });
            });

          interaction.reply({
            content: `Menestyin hashin ${urlHashed} poistossa. Refreshaan cachen vielä`,
            ephemeral: true,
          });

          fetchBlocklist();
        });
      } else {
        await db
          .collection('estolista2000')
          .doc(value)
          .delete()
          .catch((err) => {
            interaction.reply({
              content: `En menestynyt poistossa en tiiä miksi. Hash: ${value}`,
              ephemeral: true,
            });
          });

        interaction.reply({
          content: `Menestyin hashin ${value} poistossa. Refreshaan cachen vielä`,
          ephemeral: true,
        });

        fetchBlocklist();
      }
    }
  }

  if (interaction.isContextMenu()) {
    // return;
    if (interaction.commandName === 'Lisää blokkilistalle') {
      if (!checkForPerms(interaction.user.id)) {
        return interaction.reply({
          content: 'Et ole pääjehu niin et koske tähän',
          ephemeral: true,
        });
      }
      const {message} = interaction.options.get('message');
      const urls = getUrls(message.content);
      const urlArray = [...urls];

      if (message.author.id === '845750059843846144') {
        interaction.reply({
          content: `Lopeta tommonen`,
          ephemeral: true,
        });
        return;
      }

      if (message.author.bot) {
        interaction.reply({
          content: `Lopeta tommonen`,
          ephemeral: true,
        });
        return;
      }

      urlArray.forEach((url) => {
        const urlHashed = crc32(url).toString(16);
        db.collection('estolista2000')
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
        fetchBlocklist();

        interaction.reply({
          content: `Ihan ok mut [toi](${message.url}) meni estolistalle`,
        });
      } else {
        interaction.reply({
          content: `Kusetit mua eihän tossa ole edes linkkiä`,
          ephemeral: true,
        });
      }
      return;
    }

    // console.log(interaction.options);
    const target = interaction.options.get('message'); // or getUser("user")

    // console.log(target);

    const nimi = interaction.user.username;

    target.message.delete();

    const dmChan = await target.message.author
      .createDM()
      .catch((err) =>
        interaction.reply({content: 'ei tollasta', ephemeral: true})
      );

    dmChan
      .send(`${nimi} raiskasi (vac bannasi) viestisi. vituttaako?`)
      .catch((err) =>
        target.message.channel.send(
          `${nimi} raiskasi (vac bannasi) viestisi. vituttaako?`
        )
      );

    // target.createDM().then(ch => ch.send("hi").catch(async () => {
    //   return interaction.reply({ content: "DMs off! D:", ephemeral: true })
    // })
    await interaction.reply({
      content: 'Huutonaurua vammaisille ihmisille',
      ephemeral: true,
    });
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  fetchBlocklist();

  const guildi = client.guilds.cache.get('229499178018013184');

  guildi.commands.set([]);
  // guildi.commands.create({
  //   name: 'vac bannia',
  //   type: 'MESSAGE',
  //   defaultPermission: true,
  // });

  guildi.commands.create({
    name: 'Lisää blokkilistalle',
    type: 'MESSAGE',
    defaultPermission: true,
    customId: 'addToBlocklist',
  });

  guildi.commands.create({
    name: 'poistablock',
    type: 'CHAT_INPUT',
    defaultPermission: true,
    description: 'Poistaa tavaraa blokkilistalta (url linkin tai se hash)',
    options: [
      {
        name: 'hash',
        description: 'hash tai url',
        type: 'STRING',
        required: true,
      },
    ],
  });
});

client.login(process.env.token);
