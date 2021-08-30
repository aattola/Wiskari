import {
  ButtonInteraction,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageActionRowOptions,
  MessageButton,
} from 'discord.js';
import { Board } from 'tictactoe-game-modules';

function* times(x) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < x; i++) yield i;
}

class TictacManager {
  protected static instance: TictacManager;

  static getInstance(): TictacManager {
    if (!TictacManager.instance) {
      TictacManager.instance = new TictacManager();
    }
    return TictacManager.instance;
  }

  handleButtonInteraction(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('ttt')) return;

    const message = <Message>interaction.message;

    let xs = 0;
    let os = 0;

    for (const actionRow of message.components) {
      for (const button of actionRow.components) {
        if ((button as MessageButton).label === 'X') xs += 1;
        else if ((button as MessageButton).label === 'O') os += 1;
      }
    }

    const XsTurn = xs <= os;
    const i = parseInt(interaction.customId[3]);
    const j = parseInt(interaction.customId[4]);

    const buttonPressed = message.components[i - 1].components[j - 1];

    if ((buttonPressed as MessageButton).label !== ' ')
      return interaction.reply({
        content: 'EI TOMMOSIA JEKKUJA',
        ephemeral: true,
      });

    (buttonPressed as MessageButton).label = XsTurn ? 'X' : 'O';
    (buttonPressed as MessageButton).style = XsTurn ? 'SUCCESS' : 'DANGER';

    const styleToNumber = (style) =>
      // eslint-disable-next-line no-nested-ternary
      style === 'SECONDARY' ? 2 : style === 'SUCCESS' ? 3 : 4;

    const components = [];

    for (const actionRow of message.components) {
      components.push({ type: 1, components: [] });
      for (const button of actionRow.components) {
        components[components.length - 1].components.push({
          type: 2,
          label: (button as MessageButton).label,
          style: styleToNumber((button as MessageButton).style),
          custom_id: (button as MessageButton).customId,
        });
      }
    }

    const boardArray = (components as MessageActionRow[]).map((b) => {
      return b.components.map((a: MessageButton) => {
        return a.label;
      });
    });

    const boardArrayFlat: string[] = [];
    boardArray.forEach((bo) => {
      bo.forEach((a) => {
        if (a === ' ') return boardArrayFlat.push('');
        boardArrayFlat.push(a);
      });
    });
    console.log(boardArrayFlat);

    const boardSize = components.length;

    const board = new Board(boardArrayFlat);

    const over = board.isGameOver();
    const draw = board.isGameDraw();
    const winner = board.hasWinner();

    // Winnerjutut toimii vain 3x3 gridille

    if (boardSize === 3) {
      if (winner) {
        console.log('Joku voitti');
        this.disableGame(interaction, 'Peli loppui joku voitti');
        return;
      }

      if (draw) {
        console.log('tasapeli');
        this.disableGame(interaction, 'Peli loppui tasapeli');
        return;
      }

      if (over) {
        console.log('peli loppu');
        this.disableGame(interaction, 'Peli loppui ');
        return;
      }
    }

    message.edit({ components });

    interaction.deferUpdate();
  }

  disableGame(interaction: ButtonInteraction, reason = 'Peli lopetettiin') {
    if (!interaction.deferred) {
      interaction.deferUpdate();
    }

    const { components } = interaction.message;
    const messageComponents = (components as MessageActionRow[]).map((row) => {
      const komponentit = (row.components as MessageButton[]).map(
        (component) => {
          component.disabled = true;

          const disabledComponent = new MessageButton(component);
          return disabledComponent;
        }
      );

      const disabledRow = new MessageActionRow().addComponents(komponentit);

      console.log(disabledRow.components);
      return disabledRow;
    });

    (interaction.message as Message)
      .edit({
        content: reason,
        components: messageComponents,
      })
      .catch((e) => console.log({ e }));
  }

  createGame(interaction: CommandInteraction) {
    const koko = interaction.options.get('koko').value;
    const vastustaja = interaction.options.getMember('vastustaja');

    const rivit: MessageActionRow[] = [];

    for (const i of times(koko)) {
      const napit: MessageButton[] = [];
      for (const nappulat of times(koko)) {
        const nappi = new MessageButton()
          .setCustomId(`ttt${i + 1}${nappulat + 1}`)
          .setLabel(' ')
          .setStyle('SECONDARY');

        napit.push(nappi);
      }

      const rivi = new MessageActionRow().addComponents(napit);

      rivit.push(rivi);
    }

    interaction.reply({
      content: 'Videopelaamista',
      components: rivit,
    });
  }
}

export { TictacManager };
