import {
  ApplicationCommand,
  ApplicationCommandData,
  ApplicationCommandPermissionData,
  Client,
  Collection,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { SlashCommand } from './types/command';

const commandFiles = fs
  .readdirSync(path.join(__dirname, `/commands`))
  .filter((file) => {
    if (file.endsWith('.ts')) return file;
    if (file.endsWith('.js')) return file;
  });

const devGuilds = ['279272653834027008'];
const permissionGuilds = ['279272653834027008', '229499178018013184'];
const perms = {};

async function loadPerms(
  client: Client,
  komennot: Collection<string, ApplicationCommand<{}>>
) {
  komennot.forEach((komento) => {
    const permission = perms[komento.name];
    if (permission) {
      komento.permissions.set({
        permissions: permission,
      });
    }
  });
}

const loadCommands = async (client: Client) => {
  const botCommands: ApplicationCommandData[] = [];
  for (const file of commandFiles) {
    const de = await import(`./commands/${file}`);
    const command: SlashCommand = de.default;
    botCommands.push(command.data);

    if (command.permissions) {
      perms[command.data.name] = command.permissions;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    // 1. Set global commands
    // 2. Set permissions to permissionGuilds

    client.application.commands.set(botCommands).then(() => {
      console.log('[PROD commandLoader] Globaalit komennot asennettu!');
    });

    // const globalCommands = await client.application.commands.fetch();

    // eslint-disable-next-line no-restricted-syntax,guard-for-in
    // for (const commandName in perms) {
    //   const commandPerms = perms[commandName];
    //   const comm = globalCommands.filter(
    //     (globalCommand) => globalCommand.name === commandName
    //   );
    //   const command = comm.first();
    //
    //   const fullPerms = commandPerms.map((c) => {
    //     return {
    //       id: command.id,
    //       permissions: commandPerms,
    //     };
    //   });
    //
    //   permissionGuilds.forEach((guildId) => {
    //     const guild = client.guilds.cache.get(guildId);
    //     guild.commands.permissions.set({
    //       fullPermissions: fullPerms,
    //     });
    //   });
    // }
  }

  // if (process.env.NODE_ENV === 'development') {
  // devGuilds.forEach((id) => {
  //   client.guilds.fetch(id).then((guild) => {
  //     guild.commands.set([]);
  //     guild.commands.set(botCommands).then(async () => {
  //       console.log(
  //         `[${
  //           process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD'
  //         } commandLoader] Komennot asennettu guildiin ${id}`
  //       );
  //       const commands2 = await guild.commands.fetch();
  //       loadPerms(client, commands2);
  //     });
  //   });
  // });
  // }
};

export { loadCommands };
