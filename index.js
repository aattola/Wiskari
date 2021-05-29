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

  // console.log(components);

  await message.edit({ components });

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

client.on('interaction', async (interaction) => {
  if (interaction.commandName === 'tictactoe') {
    interaction.reply('gaming', {
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
