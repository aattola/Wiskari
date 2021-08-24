import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import ut from 'util';
import { SlashCommand } from '../types/command';

function clean(text) {
  if (typeof text === 'string')
    return text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`);
  return text;
}

const Eval: SlashCommand = {
  data: {
    name: 'eval',
    description: 'Evaluate sitä javascriptiä',
    defaultPermission: false,
    options: [
      {
        name: 'koodi',
        description: 'Suoritettava koodi',
        type: 'STRING',
        required: true,
      },
    ],
  },
  permissions: [
    {
      id: '214760917810937856',
      type: 'USER',
      permission: true,
    },
  ],
  async execute(interaction: CommandInteraction) {
    if (interaction.user.id === '214760917810937856') {
      const args = interaction.options.get('koodi').value;
      try {
        const code = args;
        if (typeof code === 'string') {
          // eslint-disable-next-line no-eval
          let evaled = eval(code);

          if (typeof evaled !== 'string') evaled = ut.inspect(evaled);

          interaction.reply({
            content: clean(evaled),
            ephemeral: true,
          });
        } else {
          interaction.reply({
            content: 'LAITA STRING EI SAATANA MUUTA',
            ephemeral: true,
          });
        }
      } catch (err) {
        interaction.reply({
          content: `\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``,
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply('älä vittu yritä tuommosia jekkuja ja temppuja');
    }
  },
};

export default Eval;
