/* eslint-disable no-useless-concat */
require('dotenv').config();
const Discord = require('discord.js');

const client = new Discord.Client({ intents: Discord.Intents.ALL });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // client.guilds.cache
  //   .get('229499178018013184')
  //   .channels.cache.get('229499178018013184')
  //   .send({ files: [{ attachment: 'kamverus.png' }] });

  client.api.channels['229499178018013184'].messages.post({
    data: {
      content: 'Nappuloita JOTKA JYTÄÄ vika kerta',
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'Bängereitä heti!',
              style: 1,
              custom_id: 'play',
            },
            {
              type: 2,
              label: 'vittuun täältä!',
              style: 4,
              custom_id: 'stop',
            },
            {
              type: 2,
              label: 'kontent paikka!',
              style: 5,
              disabled: true,
              url: 'https://pornhub.com/gay?aapo=onsus',
            },
          ],
        },
      ],
    },
  });
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

client.ws.on('INTERACTION_CREATE', async (interaction) => {
  console.log(interaction, 'WS EVENT');

  if (interaction.type !== 3) return;

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
    const data = {
      name: 'trollage',
      description: 'we do a little trolling',
      options: [
        {
          name: 'ukko',
          type: 'USER',
          description: 'Ketä jekutetaan',
          required: true,
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
    const commands = await client.application?.commands.delete(
      message.content.toLowerCase().split(' ')[1]
    );
    console.log(commands);
  }
});

client.login(process.env.token);
