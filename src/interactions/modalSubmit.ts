import { SlashCommandBuilder } from '@discordjs/builders';
import { ModalSubmitInteraction } from 'discord.js';

const Button = {
  data: new SlashCommandBuilder()
    .setName('modalsubmit')
    .setDescription('submittaa modal'),
  async execute(interaction: ModalSubmitInteraction) {
    if (interaction.customId === 'testmodal') {
      const testModalFirst = interaction.fields.getTextInputValue('kissa');
      const testModalSecond = interaction.fields.getTextInputValue('orava');

      console.log(testModalFirst, testModalSecond);

      await interaction.reply({
        content: `<@${interaction.user.id}> kirjoitti tälleen oletko kissa kysymykseen: ${testModalFirst}`,
      });
    }
  },
};

export default Button;
