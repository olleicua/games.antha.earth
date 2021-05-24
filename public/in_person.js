let gamestate = [];
let gameOver = false;
let victoryResult = null;

let turn = 1;
const $turn = document.querySelector('.turn');
let checkVictory;
let initGamestate;

function displayTurn() {
  switch (turn) {
    case 1:
      $turn.innerHTML = 'it\'s red\'s turn';
      break;
    case 2:
      $turn.innerHTML = 'it\'s green\'s turn';
      break;
    default:
      throw 'turn should be 1 or 2'
  }
}

function handlePieceClick(x, y, z) {
  if (gamestate[x][y][z] !== 0 || gameOver) return;

  gamestate[x][y][z] = turn;
  turn = {'1': 2, '2': 1}[turn];

  displayTurn();
  
  let victory = checkVictory();
  if (victory) {
    gameOver = true;
    victoryResult = victory;
    switch (victoryResult[0]) {
      case 1:
        $turn.innerHTML = 'red won';
        break;
      case 2:
        $turn.innerHTML = 'green won';
        break;
      default:
        throw 'winner should be 1 or 2'
    }
  }
}

document.querySelector('.reset-button').addEventListener('click', () => {
  gameOver = false;
  victoryResult = null;
  initGamestate();
  displayTurn();
});
