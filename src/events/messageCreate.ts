import { Message } from 'discord.js';
import BlockGif from '../blockGif';
import { analytics } from '../logging/analytics';
import { S3Client } from '../managers/s3';

const S3 = new S3Client();

const messageCreate = {
  data: {
    name: 'messageCreate',
  },
  async execute(message: Message) {
    BlockGif.checkMessage(message);
    S3.handleMessage(message);

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
