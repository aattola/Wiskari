import dotenv from 'dotenv';
import Discord, { Collection } from 'discord.js';
import fs from 'fs';

dotenv.config();

const client = new Discord.Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_INVITES', 'GUILD_VOICE_STATES'],
});

client.on('ready', () => {
  console.log('Kirjauduttu sisään ja valmiina. Wiskari');
});

const commands = new Collection();
const interactions = new Collection();

const commandFiles = fs
  .readdirSync(`${__dirname}\\commands`)
  .filter((file) => file.endsWith('.ts'));

const interactionFiles = fs
  .readdirSync(`${__dirname}\\interactions`)
  .filter((file) => file.endsWith('.ts'));

async function registerInteractions() {
  for (const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    commands.set(command.data.name, command);
  }

  for (const file of interactionFiles) {
    const { default: interaction } = await import(`./interactions/${file}`);
    interactions.set(interaction.data.name, interaction);
  }
}

registerInteractions();

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    try {
      const inter = interactions.get('button');
      // @ts-ignore
      await inter.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Virhe nappulassa',
        ephemeral: true,
      });
    }

    return;
  }

  if (interaction.isContextMenu()) {
    try {
      const inter = interactions.get('contextmenu');
      // @ts-ignore
      await inter.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Virhe contextissa',
        ephemeral: true,
      });
    }

    return;
  }

  if (interaction.isSelectMenu()) {
    try {
      const inter = interactions.get('selectmenu');
      // @ts-ignore
      await inter.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Virhe valintavalikossa',
        ephemeral: true,
      });
    }

    return;
  }

  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    // @ts-ignore
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

client.login(process.env.token);
