/* eslint-disable no-useless-concat */
require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const { Board, RandomChoice, Minimax } = require('tictactoe-game-modules');

const client = new Discord.Client({ intents: Discord.Intents.ALL });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // client.guilds.cache
  //   .get('229499178018013184')
  //   .channels.cache.get('229499178018013184')
  //   .send({ files: [{ attachment: 'kamverus.png' }] });
});

client.on('voiceStateUpdate', async (oldMember, newMember) => {
  if (oldMember.channel) {
    if (oldMember.channel.members.get('845750059843846144')) {
      if (oldMember.channel.members.size === 1) {
        // oot yksin puhelus kallu
        return oldMember.channel.leave();
      }
    }
  }
  if (newMember.channel) {
    if (newMember.channel.members.get('845750059843846144')) {
      if (newMember.channel.members.size === 1) {
        // oot yksin puhelus kallu
        newMember.channel.leave();
      }
    }
  }
});

client.on('voiceStateUpdate', async (oldMember, newMember) => {
  if (!oldMember.guild) return;
  if (!oldMember.channel) return;
  if (oldMember.channel.members.size === 1) {
    oldMember.channel.leave();
  }
});

function dataBuilder(board, disable = false) {
  const comps = board.map((pick, i) => {
    if (pick == 'X') {
      return {
        type: 2,
        style: 3,
        disabled: true,
        label: 'X',
        custom_id: `tictac_${i + 1}_2`,
      };
    }
    if (pick == 'O') {
      return {
        type: 2,
        style: 4,
        disabled: true,
        label: 'O',
        custom_id: `tictac_${i + 1}_3`,
      };
    }

    return {
      type: 2,
      style: 2,
      disabled: disable,
      label: ' ',
      custom_id: `tictac_${i + 1}_1`,
    };
  });

  const sortedComps = [
    {
      type: 1,
      components: [comps[0], comps[1], comps[2]],
    },
    {
      type: 1,
      components: [comps[3], comps[4], comps[5]],
    },
    {
      type: 1,
      components: [comps[6], comps[7], comps[8]],
    },
  ];

  return sortedComps;
}

function parseComponentsToGrid(comp) {
  const components = [];
  comp.forEach((c) => {
    c.components.forEach((a) => {
      components.push(a);
    });
  });

  const returnComp = components.map((co) => {
    if (co.label == ' ') return '';
    return co.label;
  });

  return returnComp;
}

function gameOver(parsedBoard, interaction) {
  client.api
    .webhooks(client.user.id, interaction.token)
    .messages(interaction.message.id)
    .delete();
  console.log('peli done');
  console.log(parsedBoard.winningPlayer());
  const data2 = dataBuilder(parsedBoard.grid, true);

  if (parsedBoard.isGameDraw()) {
    console.log('draw');
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          // flags: 64,
          content: `Peli loppui tasapeliin`,
          components: data2,
        },
      },
    });
    return;
  }

  client.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: 4,
      data: {
        // flags: 64,
        content: `Peli loppui ${
          parsedBoard.winningPlayer() == 'X'
            ? `SINÄ <@${interaction.member.user.id}> VOITIT`
            : '<@845750059843846144> voitti'
        } `,
        components: data2,
      },
    },
  });
}

const games = {};

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  console.log(interaction.data, 'WS EVENT');

  if (interaction.type !== 3) return;

  if (interaction.data.custom_id.startsWith('tictac_')) {
    // tictac roskaa
    const blockId = interaction.data.custom_id.split('_')[1];
    const blockChoice = interaction.data.custom_id.split('_')[2];

    // console.log(blockId, blockChoice, interaction.message, 'KJISSA');

    const { components } = await client.api.channels[
      interaction.channel_id
    ].messages[interaction.message.id].get();

    // console.log(components);

    const parsed = parseComponentsToGrid(components);

    let parsedBoard = new Board(parsed);

    parsedBoard = parsedBoard.makeMove(blockId, 'X');

    if (parsedBoard.isGameOver()) {
      return gameOver(parsedBoard, interaction);
    }

    // const random = new RandomChoice(parsedBoard);
    // const randomIndex = random.findRandomMove(parsedBoard);

    const minimax = new Minimax('X', 'O');

    const randomIndex = minimax.findBestMove(parsedBoard);

    parsedBoard = parsedBoard.makeMove(randomIndex, 'O');

    if (parsedBoard.isGameOver()) {
      return gameOver(parsedBoard, interaction);
    }

    const data = dataBuilder(parsedBoard.grid);

    // const data = await client.api
    //   .webhooks(client.user.id, interaction.token)
    //   .messages('@original')
    //   .get();

    // console.log(data);

    // const { token, id } = games[interaction.member.user.id];
    // console.log('TOKEN', token, id);

    client.api
      .webhooks(client.user.id, interaction.token)
      .messages(interaction.message.id)
      .delete();

    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          // flags: 64,
          content: `Video peliä <@${interaction.member.user.id}> ukon kanssa.`,
          components: data,
        },
      },
    });
  }

  if (interaction.data.custom_id == 'play') {
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: 'LAITETAA JYTÄÄ',
          flags: 64,
        },
      },
    });

    const guild = await client.guilds.fetch(interaction.guild_id);
    const guildUser = await guild.members.fetch(interaction.member.user.id);

    if (!guildUser.voice.channel) return console.log('ei jytää');

    if (guildUser.voice.connection) return;

    const connection = await guildUser.voice.channel.join();

    const dispatcher = connection.play('wiskari.mp3');
    dispatcher.setVolume(0.4);

    return;
  }

  if (interaction.data.custom_id == 'stop') {
    const guild = await client.guilds.fetch(interaction.guild_id);
    if (guild.me.voice.connection) {
      guild.me.voice.connection.disconnect();
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: 'HIMAAN',
            flags: 64,
          },
        },
      });
    } else {
      client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: 'en voi lähtee himaa jos oon jo himassa',
            flags: 64,
          },
        },
      });
    }
  }
});

client.on('interaction', async (interaction) => {
  console.log('INTERACTION');
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'tictactoe') {
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content: `Video peliä <@${interaction.member.user.id}> ukon kanssa.`,
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_1_1',
                },
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_2_1',
                },
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_3_1',
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_4_1',
                },
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_5_1',
                },
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_6_1',
                },
              ],
            },
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_7_1',
                },
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_8_1',
                },
                {
                  type: 2,
                  style: 2,
                  label: ' ',
                  custom_id: 'tictac_9_1',
                },
              ],
            },
          ],
        },
      },
    });

    // games[interaction.member.user.id] = {
    //   token: interaction.token,
    //   id: interaction.id,
    // };
  }

  if (interaction.commandName === 'nappulat') {
    const row = new Discord.MessageActionRow()
      .addComponent(
        new Discord.MessageButton()
          .setCustomID('play')
          .setLabel('Bängereitä heti!')
          .setStyle('PRIMARY')
      )
      .addComponent(
        new Discord.MessageButton()
          .setCustomID('stop')
          .setLabel('vittuun täältä!')
          .setStyle('PRIMARY')
      )
      .addComponent(
        new Discord.MessageButton()
          .setURL('https://pornhub.com/gay?aapo=onsus')
          .setLabel('kontent paikka!')
          .setStyle('LINK')
      );

    await interaction.reply({ content: 'Ota nappulas', components: [row] });
    return;
    // client.api.interactions(interaction.id, interaction.token).callback.post({
    //   data: {
    //     type: 4,
    //     data: {
    //       content: 'Nappuloita JOTKA JYTÄÄ ',
    //       components: [
    //         {
    //           type: 1,
    //           components: [
    //             {
    //               type: 2,
    //               label: 'Bängereitä heti!',
    //               style: 1,
    //               custom_id: 'play',
    //             },
    //             {
    //               type: 2,
    //               label: 'vittuun täältä!',
    //               style: 4,
    //               custom_id: 'stop',
    //             },
    //             {
    //               type: 2,
    //               label: 'kontent paikka!',
    //               style: 5,
    //               disabled: false,
    //               url: 'https://pornhub.com/gay?aapo=onsus',
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   },
    // });
  }

  if (interaction.commandName === 'trollage') {
    await interaction.reply('<:troll:837372281554599956>');
    const { member } = interaction.options[0];
    if (member.voice.channel) {
      const connection = await member.voice.channel.join();

      const eventStream = connection.receiver.createStream(member.id, {
        end: 'manual',
      });

      let timmu;

      const dispatcher = connection.play('wiskari.mp3');

      eventStream.on('data', (data) => {
        clearTimeout(timmu);
        // if (data.length === 3) {
        //   return dispatcher.pause();
        // }
        if (dispatcher.paused) dispatcher.resume();
        timmu = setTimeout(() => {
          dispatcher.pause();
        }, 250);
      });

      eventStream.on('end', async () => {
        connection.disconnect();
        await interaction.followUp(
          '<:troll:837372281554599956> trollaus on ohi koska trollattava lähti',
          {
            ephemeral: true,
          }
        );
      });

      dispatcher.setVolume(0.35); // half the volume
      dispatcher.pause();

      dispatcher.on('finish', async () => {
        connection.disconnect();
        await interaction.followUp(
          '<:troll:837372281554599956> trollaus on ohi koska musa loppu',
          {
            ephemeral: true,
          }
        );
      });
    } else {
      await interaction.followUp('Ukon pitää olla kanavassa', {
        ephemeral: true,
      });
    }
  }
});

client.on('message', async (message) => {
  if (
    message.content.toLowerCase() === '!deploy' &&
    message.author.id === '214760917810937856'
  ) {
    // const data = {
    //   name: 'trollage',
    //   description: 'we do a little trolling',
    // options: [
    //   {
    //     name: 'ukko',
    //     type: 'USER',
    //     description: 'Ketä jekutetaan',
    //     required: true,
    //   },
    // ],
    // };

    // const data = {
    //   name: 'nappulat',
    //   description: 'uusia dc nappuloita (toimii vaan kun botti päällä)',
    // };

    const data = {
      name: 'tictactoe',
      description: 'videopeli discordissa',
      options: [
        {
          name: 'ukko',
          type: 'USER',
          description: 'Ketä vastaan taistelemme.',
          required: false,
        },
      ],
    };

    const command = await client.guilds.cache
      .get(message.guild.id)
      ?.commands.create(data);
    console.log(command);
  }
  if (
    message.content.toLowerCase() === '!commands' &&
    message.author.id === '214760917810937856'
  ) {
    const commands = await client.application?.commands.fetch();
    const commandsGuild = await client.guilds.cache
      .get(message.guild.id)
      ?.commands.fetch();
    message.reply(
      'Applikaatio tasol: ' + `\`\`\`${JSON.stringify(commands, null, 4)}\`\`\``
    );
    message.reply(
      'Guild tasol: ' + `\`\`\`${JSON.stringify(commandsGuild, null, 4)}\`\`\``
    );
  }

  if (
    message.content.toLowerCase().startsWith('!delete') &&
    message.author.id === '214760917810937856'
  ) {
    console.log('poistetaan', message.content.toLowerCase().split(' ')[1]);

    const command = await client.guilds.cache
      .get(message.guild.id)
      ?.commands.delete(message.content.toLowerCase().split(' ')[1]);
    console.log(command);
  }
});

client.login(process.env.token);
