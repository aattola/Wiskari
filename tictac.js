const { Board, RandomChoice } = require('tictactoe-game-modules');

console.log(Board);

let board = new Board(['', '', '', '', '', '', '', '', '']);

console.log(board);

console.log(board.colums);

board = board.makeMove(3, 'X');

console.log(board.colums);

const random = new RandomChoice(board);
console.log(board.makeMove(random.findRandomMove(board), 'O'));

console.log(board.colums);
