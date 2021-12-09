import {
  ButtonInteraction,
  CommandInteraction,
  ContextMenuInteraction,
  Interaction,
  Message,
  Presence,
  SnowflakeUtil,
  StageChannel,
  TextChannel,
  VoiceChannel,
} from 'discord.js';
import Analytics from 'analytics-node';
import dotenv from 'dotenv';

dotenv.config();

interface IdentifyOptions {
  userId: string;
  traits: {
    name: string;
    avatar: string;
    createdAt: string;
    id: string;
  };
}

interface TrackOptions {
  userId: string;
  event: string;
  properties: {
    type: string;
    command?: string;
    interaction?: Interaction;
    executedAt: number;
    channel?: VoiceChannel | TextChannel | StageChannel;
    message?: Message;
    presence?: Presence;
  };
}

interface GroupOptions {
  userId: string;
  groupId: string;
  traits?: any;
}

interface Analytiikka {
  identify(options: IdentifyOptions): void;
  track(options: TrackOptions): void;
  group(options: GroupOptions): void;
}

const analytics: Analytiikka = new Analytics(process.env.analytics);

function runAnalytics(
  name: string,
  commandName: string,
  interaction:
    | CommandInteraction
    | ContextMenuInteraction
    | ButtonInteraction
    | Interaction
) {
  analytics.track({
    userId: interaction.user.id,
    event: 'interaction',
    properties: {
      type: name,
      command: commandName,
      interaction: {
        id: interaction.id, // @ts-ignore
        userId: interaction.user.id,
        username: interaction.user.username,
      },
      executedAt: Date.now(),
    },
  });

  analytics.identify({
    userId: interaction.user.id,
    traits: {
      name: interaction.user.username,
      avatar: interaction.user.avatarURL({ format: 'png', size: 512 }),
      createdAt: SnowflakeUtil.deconstruct(interaction.user.id).date.toString(),
      id: interaction.user.id,
    },
  });
}

export { analytics, runAnalytics };
