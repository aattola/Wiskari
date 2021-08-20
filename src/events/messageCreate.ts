import { Message } from 'discord.js';
import BlockGif from '../blockGif';
import { analytics } from '../logging/analytics';

const messageCreate = {
  data: {
    name: 'messageCreate',
  },
  async execute(message: Message) {
    BlockGif.checkMessage(message);

    if (!message.author.bot) {
      analytics.track({
        userId: message.author.id,
        event: 'messageCreate',
        properties: {
          type: 'message',
          message,
          executedAt: Date.now(),
        },
      });
    }
  },
};

export default messageCreate;
