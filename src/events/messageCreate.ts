import { Message } from 'discord.js';
import BlockGif from '../managers/blockGif';
import { analytics } from '../logging/analytics';
import { S3Client } from '../managers/s3';
import { Nettiauto } from '../managers/nettiauto';

const S3 = new S3Client();
const nettiauto = new Nettiauto();

const messageCreate = {
  data: {
    name: 'messageCreate',
  },
  async execute(message: Message) {
    BlockGif.checkMessage(message);
    S3.handleMessage(message);
    nettiauto.onMessage(message);

    if (message.content.toLowerCase() === 'get') {
      // gettistä
      message.reply(`Gettistä: ${message.id}`);
    }

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
