import { Player } from 'discord-player';
import { client } from '../index';

const player = new Player(client);

player.on('trackStart', (queue, track) =>
  (queue.metadata as any).channel.send(`DEV nyt soi: ${track.title}`)
);

export { player };
