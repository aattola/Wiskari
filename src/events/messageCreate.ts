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
      if (idSplit[idSplit.length - 3] === idSplit[idSplit.length - 4]) {
        if (idSplit[idSplit.length - 4] === idSplit[idSplit.length - 5]) {
          return message.reply({
            content: `HYVÄ PENTA GETTI UKKO ${message.id}`,
            files: ['https://i.imgur.com/hwNEPfz.jpeg'],
          });
        }
        return message.reply({
          content: `HALOOOOO QUADROT ${message.id}`,
          files: ['https://i.imgur.com/UHndwBg.png'],
        });
      }
      return message.reply(`HALOOOOO **TRIPLAT** ${message.id}`);
    }
    return message.reply(`MORO **TUPLAT** ${message.id}`);
  }

  const rNumber = Math.round(Math.random() * 100);
  if (rNumber >= 95) {
    return message.reply(
      `Mitäs jos gettaamisen sijasta gettaisit itsellesi *ämmiä*: ${message.id}`
    );
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
