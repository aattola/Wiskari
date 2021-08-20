import { Message, User, VoiceState } from 'discord.js';
import { analytics } from '../analytics';

const messageCreate = {
  data: {
    name: 'voiceStateUpdate',
  },
  async execute(oldUser: VoiceState, newUser: VoiceState) {
    const { member } = newUser;

    if (!member.voice.channel) {
      analytics.track({
        userId: member.id,
        event: 'leaveChannel',
        properties: {
          type: 'voiceChannel',
          channel: oldUser.member.voice.channel,
          executedAt: Date.now(),
        },
      });
      return;
    }
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