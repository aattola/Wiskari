/* eslint-disable no-plusplus */
/* eslint-disable no-useless-concat */
require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const { Board, RandomChoice, Minimax } = require('tictactoe-game-modules');

const client = new Discord.Client({ intents: Discord.Intents.ALL });
// const disbut = require('discord-buttons')(client);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // client.guilds.cache
  //   .get('229499178018013184')
  //   .channels.cache.get('229499178018013184')
  //   .send({ files: [{ attachment: 'kamverus.png' }] });
});

/**
 *
 * @param {Discord.MessageComponentInteraction} interaction
 */
async function updateGrid(interaction) {
  /** @type {Discord.Message} message */
  const { message } = interaction;

  let xs = 0;
  let os = 0;

  for (const actionRow of message.components) {
    for (const button of actionRow.components) {
      if (button.label === 'X') xs++;
      else if (button.label === 'O') os++;
    }
  }

  const XsTurn = xs <= os;
  const i = parseInt(interaction.customID[3]);
  const j = parseInt(interaction.customID[4]);

  const buttonPressed = message.components[i - 1].components[j - 1];

  if (buttonPressed.label !== ' ')
    return interaction.reply('Älä laita tällästä', {
      ephemeral: true,
    });

  buttonPressed.label = XsTurn ? 'X' : 'O';
  buttonPressed.style = XsTurn ? 'SUCCESS' : 'DANGER';

  const styleToNumber = (style) =>
    // eslint-disable-next-line no-nested-ternary
    style === 'SECONDARY' ? 2 : style === 'SUCCESS' ? 3 : 4;

  const components = [];

  for (const actionRow of message.components) {
    components.push({ type: 1, components: [] });
    for (const button of actionRow.components) {
      components[components.length - 1].components.push({
        type: 2,
        label: button.label,
        style: styleToNumber(button.style),
        custom_id: button.customID,
      });
    }
  }

  const { id } = interaction.member.user;

  await message.edit(
    `${`<@${id}> laittoi ${buttonPressed.label} paikkaan: ` + '`'}${i}\`` +
      `x\`${j}\``,
    { components }
  );

  await interaction.deferUpdate();
}

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  // console.log(interaction.data, 'WS EVENT');

  if (interaction.type !== 3) return;

  if (interaction.data.custom_id === 'play') {
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

  if (interaction.data.custom_id === 'stop') {
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

function* times(x) {
  for (let i = 0; i < x; i++) yield i;
}

client.on('interaction', async (interaction) => {
  if (interaction.commandName === 'tictactoe') {
    if (interaction.options[0]) {
      if (interaction.options[0].name === 'numero') {
        const { value } = interaction.options[0];

        const things = [];

        for (const i of times(value)) {
          const components = [];

          for (const i2 of times(value)) {
            components.push({
              type: 2,
              label: ' ',
              style: 2,
              custom_id: `ttt${i + 1}${i2 + 1}`,
            });
          }

          things.push({
            type: 1,
            components,
          });
        }

        return interaction.reply('Tic Tac Toe', {
          components: things,
        });
      }
    }
    interaction.reply('Tic Tac Toe', {
      components: [
        {
          type: 1,
          components: [
            { type: 2, label: ' ', style: 2, custom_id: 'ttt11' },
            { type: 2, label: ' ', style: 2, custom_id: 'ttt12' },
            { type: 2, label: ' ', style: 2, custom_id: 'ttt13' },
          ],
        },
        {
          type: 1,
          components: [
            { type: 2, label: ' ', style: 2, custom_id: 'ttt21' },
            { type: 2, label: ' ', style: 2, custom_id: 'ttt22' },
            { type: 2, label: ' ', style: 2, custom_id: 'ttt23' },
          ],
        },
        {
          type: 1,
          components: [
            { type: 2, label: ' ', style: 2, custom_id: 'ttt31' },
            { type: 2, label: ' ', style: 2, custom_id: 'ttt32' },
            { type: 2, label: ' ', style: 2, custom_id: 'ttt33' },
          ],
        },
      ],
    });
  } else if (
    interaction.isMessageComponent() &&
    interaction.customID.startsWith('ttt')
  ) {
    await updateGrid(interaction);
  }

  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'nappulat') {
    const row = new Discord.MessageActionRow().addComponents([
      new Discord.MessageButton()
        .setCustomID('play')
        .setLabel('Bängereitä heti!')
        .setStyle('PRIMARY'),

      new Discord.MessageButton()
        .setCustomID('stop')
        .setLabel('vittuun täältä!')
        .setStyle('PRIMARY'),

      new Discord.MessageButton()
        .setURL('https://pornhub.com/gay?aapo=onsus')
        .setLabel('kontent paikka!')
        .setStyle('LINK'),
    ]);

    const row2 = new Discord.MessageActionRow().addComponents([
      new Discord.MessageSelectMenu()
        .addOptions([
          {
            label: 'Huutis',
            value: 1,
            description: 'Huutonauris',
          },
          {
            label: 'Kääkkis',
            value: 3,
            description: 'Kääkkistä vammasille',
          },
          {
            label: 'Pärskis',
            value: 4,
            description: 'Huutiainen',
          },
        ])
        .setCustomID('sheesh')
        .setPlaceholder('valitse jotain vammane'),
    ]);

    await interaction.reply({
      content: 'Ota nappulas',
      components: [row],
    });

    await interaction.reply({
      content: 'Ja tosta tommoset (jos näkyy vielä)',
      components: [row2],
    });

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
      description: 'videopelaamista discordissa',
      options: [
        {
          name: 'numero',
          type: 'INTEGER',
          description: 'Kuinka iso pelialue',
          choices: [
            {
              name: '2x2',
              value: 2,
            },
            {
              name: '3x3',
              value: 3,
            },
            {
              name: '4x4',
              value: 4,
            },
            {
              name: '5x5',
              value: 5,
            },
          ],
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
