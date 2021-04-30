let gamestate = [];
let gameOver = false;
let victoryResult = null;

let turn = 1;
const $turn = document.querySelector('.turn');
let checkVictory;

function handlePieceClick(x, y, z) {
  if (gamestate[x][y][z] !== 0 || gameOver) return;

  gamestate[x][y][z] = turn;
  turn = {'1': 2, '2': 1}[turn];

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
  gamestate = [];
  for (let x = 0; x < 4; x ++) {
    gamestate.push([]);
    for (let y = 0; y < 4; y ++) {
      gamestate[x].push([]);
      for (let z = 0; z < 4; z ++) {
        gamestate[x][y].push(0);
      }
    }
  }
});
