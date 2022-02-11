import { MessageActionRow, MessageButton } from 'discord.js';

const rivi1 = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId('kananuudeli')
    .setLabel('KANA NUUDELILLA')
    .setStyle('SUCCESS'),
  new MessageButton()
    .setCustomId('kanariisi')
    .setLabel('KANA RIISILLÄ')
    .setStyle('SUCCESS')
);
const rivi2 = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId('olenhomo')
    .setLabel('Ei kiinnosta. Olen umpihomo')
    .setStyle('SECONDARY')
);

export { rivi1, rivi2 };
