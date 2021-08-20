import { Presence } from 'discord.js';
import { analytics } from '../logging/analytics';

const messageCreate = {
  data: {
    name: 'presenceUpdate',
  },
  async execute(oldPresence: Presence, newPresence: Presence) {
    analytics.track({
      userId: newPresence.user.id,
      event: 'presenceUpdate',
      properties: {
        type: 'presence',
        presence: newPresence,
        executedAt: Date.now(),
      },
    });
  },
};

export default messageCreate;
