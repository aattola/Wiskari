import { Client, CommandInteraction, Invite, VoiceChannel } from 'discord.js';
import { SlashCommand } from '../types/command';

const embedGames = [
  {
    name: 'youtube',
    value: '755600276941176913',
  },
  {
    name: 'kalaa',
    value: '814288819477020702',
  },
  {
    name: 'shakki',
    value: '832012586023256104',
  },
  {
    name: 'pokeri',
    value: '755827207812677713',
  },
  {
    name: 'betrayal',
    value: '773336526917861400',
  },
  {
    name: 'Word Snack',
    value: '879863976006127627',
  },
  {
    name: 'Doodle Crew',
    value: '878067389634314250',
  },
  {
    name: 'Letter Tile',
    value: '879863686565621790',
  },
];

const Aktiiviteetti: SlashCommand = {
  data: {
    name: 'aktiiviteetti',
    description: 'Hassuja hupsuja pelejä',
    options: [
      {
        type: 'STRING',
        name: 'aktiiviteetti',
        description: 'Mikä aktiiviteetti otetaan',
        required: true,
        choices: embedGames,
      },
    ],
  },
  async execute(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const guildId = interaction.guild?.id;
    if (!guildId) return console.log('ei guildid');

    const guild = await client.guilds.fetch(guildId);
    const guildMember = await guild.members.fetch(interaction.user.id);

    if (!guildMember.voice.channel) {
      return interaction.reply({
        content: 'Mene äänikanavaan eka',
        ephemeral: true,
      });
    }

    const voiceChannel = (await client.channels.fetch(
      guildMember.voice.channel.id
    )) as VoiceChannel;

    const value = interaction.options.getString('aktiiviteetti');
    // const message = <Message>value.message;

    const game = embedGames.filter((a) => a.value === value)[0];

    // @ts-ignore
    const apiInvite = await client.api.channels(voiceChannel.id).invites.post({
      data: {
        max_age: 43200,
        max_uses: 0,
        target_application_id: value,
        target_type: 2,
        temporary: false,
      },
    });

    // @ts-ignore
    const invite = await new Invite(client, apiInvite);

    return interaction.reply(
      `[Tästä](<${invite.url}>) pääset vetämään: ${game.name} kanavalla: <#${voiceChannel.id}>.`
    );
  },
};

export default Aktiiviteetti;
