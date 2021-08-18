import { Message } from 'discord.js';
import BlockGif from '../blockGif';

const messageCreate = {
  data: {
    name: 'messageCreate',
  },
  async execute(message: Message) {
    BlockGif.checkMessage(message);
  },
};

export default messageCreate;
