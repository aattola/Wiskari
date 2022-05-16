import Discord, {
  ButtonInteraction,
  Collection,
  CommandInteraction,
  ContextMenuInteraction,
  SelectMenuInteraction,
  TextChannel,
} from 'discord.js';

import fs from 'fs';

import path from 'path';
import dotenv from 'dotenv';
import { runAnalytics } from './logging/analytics';
import { Sentry } from './logging/sentry';
import { loadCommands } from './commandLoader';

// eslint-disable-next-line import/first
import './managers/s3';
import blockGif from './managers/blockGif';

dotenv.config();
// const knex = Knex({
//   client: 'pg',
//   connection: {
//     host: '127.0.0.1',
//     user: 'bob',
//     password: 'root',
//     database: 'testinen',
//   },
// });

const client = new Discord.Client({
  presence: {
    status: 'online',
    activities: [
      {
        name: 'Asari menot 11.6.2022',
        type: 'WATCHING',
      },
    ],
  },
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_INVITES', 'GUILD_VOICE_STATES'],
  ws: { properties: { $browser: 'Discord iOS' } },
});

// const prisma = new PrismaClient();

client.on('ready', async () => {
  console.log('[Discord] Kirjauduttu sisään ja valmiina. Wiskari');

  loadCommands(client);
  await blockGif.fetchBlocklist();

  // const ctxMenu = new ContextMenuCommandBuilder()
  //   .setName('Lisää blokkilistalle')
  //   .setType(3)
  //   .setDefaultPermission(true);

  // const remove = new SlashCommandBuilder()
  //   .setName('poistablock')
  //   .setDescription('testiblock')
  //   .addStringOption((option) => {
  //     option.setName('hash');
  //     option.setDescription('test');
  //     option.setRequired(true);
  //     return option;
  //   });

  // const guild = await client.guilds.fetch('229499178018013184');
  // console.log(guild.name);
  // // @ts-ignore
  // await guild.commands.set([]);
});

const commands = new Collection();
const interactions = new Collection();

const commandFiles = fs
  .readdirSync(path.join(__dirname, `/commands`))
  .filter((file) => {
    if (file.endsWith('.ts')) return file;
    if (file.endsWith('.js')) return file;
  });

const interactionFiles = fs
  .readdirSync(path.join(__dirname, `/interactions`))
  .filter((file) => {
    if (file.endsWith('.ts')) return file;
    if (file.endsWith('.js')) return file;
  });

const eventFiles = fs
  .readdirSync(path.join(__dirname, `/events`))
  .filter((file) => {
    if (file.endsWith('.ts')) return file;
    if (file.endsWith('.js')) return file;
  });

async function registerInteractions() {
  for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    commands.set(command.data.name, command);
  }

  for (const file of interactionFiles) {
    const { default: interaction } = await import(`./interactions/${file}`);
    interactions.set(interaction.data.name, interaction);
  }

  for (const file of eventFiles) {
    const { default: event } = await import(`./events/${file}`);
    client.on(event.data.name, event.execute);
  }
}

registerInteractions();

function handleInteractionError(
  interaction:
    | CommandInteraction
    | ContextMenuInteraction
    | ButtonInteraction
    | SelectMenuInteraction,
  error: any
) {
  console.error('[KOMENTO VIRHE]', error);
  Sentry.captureException(error, {
    user: interaction.user,
    tags: {
      bug: 'interaction',
    },
    extra: {
      interaction,
      type: interaction.type,
    },
  });
  if (interaction.replied) {
    interaction.editReply({
      content: `Virhe interactionissa: ${interaction.id} ${interaction.type}`,
    });
    return;
  }
  interaction.reply({
    content: `Virhe interactionissa: ${interaction.id} ${interaction.type}`,
    ephemeral: true,
  });
}

client.on('interactionCreate', async (interaction) => {
  Sentry.setUser({
    username: interaction.user.username,
    id: interaction.user.id,
    avatar: interaction.user.avatarURL(),
  });

  const sentryInteraction = {
    id: interaction.id,
    type: interaction.type,
    token: interaction.token,
    channel: {
      id: interaction.channel?.id,
      name: (interaction.channel as TextChannel).name,
    },
    guild: {
      id: interaction.guild?.id,
      name: interaction.guild?.name,
    },
    user: {
      id: interaction.user.id,
      name: interaction.user.username,
    },
    options: (interaction as CommandInteraction).options
      ? (interaction as CommandInteraction).options.data.map((a) => a.name)
      : 'Ei optionei',
  };

  const transaction = Sentry.startTransaction({
    op: `interaction@${interaction.type}`,
    name: interaction.id,
    data: {
      interaction: sentryInteraction,
    },
  });

  console.log(transaction, 1, Sentry);

  Sentry.addBreadcrumb({
    category: 'interaction',
    message: `Uusi interaction jonka id: ${interaction.id} ${interaction.type}`,
    level: Sentry.Severity.Info,
    data: sentryInteraction,
  });

  if (interaction.isButton()) {
    try {
      const inter = interactions.get('button');

      runAnalytics('button', interaction.customId, interaction);
      // @ts-ignore
      await inter.execute(interaction);
      // transaction.setStatus('ok');
    } catch (error) {
      handleInteractionError(interaction, error);
    }

    transaction.finish();
    return;
  }

  if (interaction.isContextMenu()) {
    try {
      const inter = interactions.get(interaction.commandName);
      if (!inter) {
        await interaction.reply({
          content:
            'Virhe contextissa. Tuollaista nappulaa ei ole koodattu' +
            ' (ei löytynyt interaction kansiosta oikealla nimellä)',
          ephemeral: true,
        });
        return;
      }

      runAnalytics('contextMenu', interaction.commandName, interaction);

      // @ts-ignore
      await inter.execute(interaction);
      // transaction.setStatus('ok');
    } catch (error) {
      handleInteractionError(interaction, error);
    }

    transaction.finish();
    return;
  }

  if (interaction.isSelectMenu()) {
    try {
      const inter = interactions.get('selectmenu');

      runAnalytics('selectMenu', interaction.customId, interaction);

      // @ts-ignore
      await inter.execute(interaction);
      // transaction.setStatus('ok');
    } catch (error) {
      handleInteractionError(interaction, error);
    }

    transaction.finish();
    return;
  }

  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    runAnalytics('command', interaction.commandName, interaction);

    // @ts-ignore
    await command.execute(interaction, client);
    console.log(transaction);
    // transaction.setStatus('ok');
  } catch (error) {
    handleInteractionError(interaction, error);
  }

  transaction.finish();
});

client.login(process.env.token);

// @ts-ignore
global.client = client;

export { client };
