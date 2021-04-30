// TODO:
//  - verify whether ping is helping
//  - make a reload button for connection closed
//  - better debugging for connection count

let gamestate = [];
let gameOver = false;
let victoryResult = null;

const connection = new WebSocket("ws://3d-connect-4.glitch.me:80/game");
const $connectionStatus = document.querySelector('.connection-status');
connection.onopen = (event) => {
  $connectionStatus.innerHTML = 'connected';
};

connection.onclose = (event) => {
  $connectionStatus.innerHTML = 'connection closed';
};

connection.onerror = (event) => {
  $connectionStatus.innerHTML = 'something went wrong';
};

const $turn = document.querySelector('.turn');
let checkVictory;

connection.onmessage = (event) => {
  const message = JSON.parse(event.data);

  document.querySelector('.connection-count').innerHTML = `people: ${message.connection_count}`;
  
  if (message.reset) {
    gameOver = false;
    victoryResult = null;
  }
  
  if (gameOver) return;

  gamestate = message.gamestate;

  switch (message.turn) {
    case 1:
      $turn.innerHTML = 'it\'s red\'s turn';
      break;
    case 2:
      $turn.innerHTML = 'it\'s green\'s turn';
      break;
    default:
      throw 'turn should be 1 or 2'
  }

  document.querySelectorAll('.taken, .you, .claim-button').forEach(($el) => {
    $el.style.display = 'none';
  });
  ['red', 'green'].forEach((player) => {
    switch (message[player]) {
      case 'available':
        document.querySelector(`.${player}-player .claim-button`).style.display = 'inline-block'
        break;
      case 'someone':
        document.querySelector(`.${player}-player .taken`).style.display = 'inline-block'
        break;
      case 'you':
        document.querySelector(`.${player}-player .you`).style.display = 'inline-block'
        break;
      default:
        throw 'turn should be 1 or 2'
    }
  });
  
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
};

document.querySelector('.red-player .claim-button').addEventListener('click', () => {
  connection.send(JSON.stringify({
    action: 'claim',
    color: 'red'
  }));
});
document.querySelector('.green-player .claim-button').addEventListener('click', () => {
  connection.send(JSON.stringify({
    action: 'claim',
    color: 'green'
  }));
});
document.querySelector('.reset-button').addEventListener('click', () => {
  connection.send(JSON.stringify({
    action: 'reset'
  }));
});

function handlePieceClick(x, y, z) {
  //console.log(x,y,z);

  if (gamestate[x][y][z] === 0) {
    connection.send(JSON.stringify({
      action: 'play',
      position: [x, y, z]
    }));
  }
}

function ping() {
  console.log(123);
  connection.send(JSON.stringify({ action: 'ping' }));
  setTimeout(ping, 2500);
}
ping();