import { Client, CommandInteraction, Invite, VoiceChannel } from 'discord.js';

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
];

const Aktiiviteetti = {
  data: {
    name: 'aktiiviteetti',
  },
  async execute(
    interaction: CommandInteraction,
    client: Client
  ): Promise<void> {
    const guildId = interaction.guild.id;

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

    const game = embedGames.filter((a) => a.name === value)[0];

    // @ts-ignore
    const apiInvite = await client.api.channels(voiceChannel.id).invites.post({
      data: {
        max_age: 604800,
        max_uses: 0,
        target_application_id: game.value,
        target_type: 2,
        temporary: false,
      },
    });

    const invite = await new Invite(client, apiInvite);

    return interaction.reply(
      `[Tästä](<${invite.url}>) pääset vetämään: ${game.name} kanavalla: <#${voiceChannel.id}>.`
    );
  },
};

export default Aktiiviteetti;
