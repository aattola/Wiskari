import { Client } from 'discord.js';

const Ready = {
  data: {
    name: 'ready',
  },
  async execute(client: Client) {
    // const commands = await client.application.commands.fetch();
    //
    // console.log(commands);
  },
};

export default Ready;
