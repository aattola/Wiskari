import { CommandInteraction } from 'discord.js';

function NotPlayingError(interaction: CommandInteraction): void {
  let errorMessage = 'Mitään ei soi ukko. Mitäs jos soittaisit jotain.';
  if (process.env.NODE_ENV === 'development') {
    errorMessage = 'DEV EI soi mitään NotPlayingError';
  }
  interaction.reply({
    content: errorMessage,
    ephemeral: true,
  });
}

function NotInCallError(interaction: CommandInteraction): void {
  let errorMessage = 'Et ole missään puhelussa herätys!';
  if (process.env.NODE_ENV === 'development') {
    errorMessage = 'DEV Et ole puhelussa NotInCallError';
  }
  interaction.reply({
    content: errorMessage,
    ephemeral: true,
  });
}

function CustomError(interaction: CommandInteraction, err: string): void {
  let errorMessage = err;
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
    errorMessage = `DEV CustomError: ${err}`;
  }
  interaction.reply({
    content: errorMessage,
    ephemeral: true,
  });
}

export { NotPlayingError, NotInCallError, CustomError };
