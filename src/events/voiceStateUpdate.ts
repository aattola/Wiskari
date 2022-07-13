import { Message, TextChannel, User, VoiceState } from 'discord.js';
import { analytics } from '../logging/analytics';
import { client } from '../index';

const messageCreate = {
  data: {
    name: 'voiceStateUpdate',
  },
  async execute(oldUser: VoiceState, newUser: VoiceState) {
    const { member } = newUser;
    if (!member) return;
    if (!oldUser.member) return;

    if (!member.voice.channel) {
      analytics.track({
        userId: member.id,
        event: 'leaveChannel',
        properties: {
          type: 'voiceChannel',
          channel: oldUser.member.voice.channel as any,
          executedAt: Date.now(),
        },
      });
      return;
    }

    // if (member.id === '286963674990772226') {
    //   if (newUser.member?.voice.deaf) {
    //     // ukko 286963674990772226 on laittanut deafen moden päälle
    //     if (newUser.member.voice.channel?.id === '704392425338175610') return;

    //     setTimeout(async () => {
    //       // tsekataan uusiksi onko deafen
    //       const guild = await client.guilds.fetch('229499178018013184');
    //       const gmember = await guild.members.fetch('286963674990772226');
    //       if (!gmember.voice) return;
    //       if (gmember.voice.deaf) {
    //         await gmember.voice.setChannel('704392425338175610').catch(() => {
    //           console.log('huutis ei oikeuksia');
    //         });
    //         const chatti = (await guild.channels.cache.get(
    //           '229499178018013184'
    //         )!) as TextChannel;
    //         await chatti.send(
    //           '<@286963674990772226> Häipyi afkiin koska afkasi 5 minuuttia!'
    //         );
    //       }
    //     }, 60 * 1000 * 5);
    //   }
    // }

    analytics.track({
      userId: member.id,
      event: 'joinChannel',
      properties: {
        type: 'voiceChannel',
        channel: member.voice.channel,
        executedAt: Date.now(),
      },
    });

    // analytics.group({
    //   userId: member.id,
    //   groupId: member.voice.channel.id,
    //   traits: {
    //     name: member.voice.channel.name,
    //     people: member.voice.channel.members.size,
    //   },
    // });
  },
};

export default messageCreate;
