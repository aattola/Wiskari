import { Message } from 'discord.js';
import BlockGif from '../managers/blockGif';
import { analytics } from '../logging/analytics';
import { S3Client } from '../managers/s3';
import { Nettiauto } from '../managers/nettiauto';

const S3 = new S3Client();
const nettiauto = new Nettiauto();

function gettistä(message: Message) {
  const idSplit = message.id.split('');
  if (idSplit[idSplit.length - 1] === idSplit[idSplit.length - 2]) {
    if (idSplit[idSplit.length - 2] === idSplit[idSplit.length - 3]) {
      if (idSplit[idSplit.length - 4] === idSplit[idSplit.length - 5]) {
        if (idSplit[idSplit.length - 5] === idSplit[idSplit.length - 6]) {
          return message.reply(`TUPLAT HALOOOOO PENTAT ${message.id}`);
        }
        return message.reply(`TUPLAT HALOOOOO QUADROT ${message.id}`);
      }
      return message.reply(`TUPLAT HALOOOOO TRIPLAT ${message.id}`);
    }
    return message.reply(`TUPLAT HALOOOOO TUPLAT ${message.id}`);
  }

  message.reply(`Gettistä: ${message.id}`);
}

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
      gettistä(message);
    }

    if (message.content.toLowerCase() === 'gettistä') {
      // gettistä
      gettistä(message);
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
