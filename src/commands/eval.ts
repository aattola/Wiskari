import Discord, { CommandInteraction } from 'discord.js';
import ut from 'util';
import { SlashCommand } from '../types/command';
import { client } from '../index';

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
          // @ts-ignore
          global.client = client;
          // eslint-disable-next-line no-eval
          let evaled = eval(code);

          if (typeof evaled !== 'string') evaled = ut.inspect(evaled);
          const splitMessage = Discord.Util.splitMessage(clean(evaled), {
            maxLength: 1950,
          });
          if (splitMessage[1]) {
            console.log(clean(evaled));
            return interaction.reply({
              content: `${splitMessage[0]}\n Loput ovat konsolissa`,
              ephemeral: true,
            });
          }
          await interaction.reply({
            content: splitMessage[0],
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'LAITA STRING EI SAATANA MUUTA',
            ephemeral: true,
          });
        }
      } catch (err) {
        await interaction.reply({
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
