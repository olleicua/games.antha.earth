const WebSocket = require('ws');

const clients = [];

let gamestate = [];
let turn = null;

const reset = () => {
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
  turn = 1;
};
reset();
let redPlayer = null;
let greenPlayer = null;
let resetting = false;
const updateClient = (client) => {
  client.send(JSON.stringify({
    gamestate,
    turn,
    red: !redPlayer ? 'available' : redPlayer.id === client.id ? 'you' : 'someone',
    green: !greenPlayer ? 'available' : greenPlayer.id === client.id ? 'you' : 'someone',
    reset: resetting
  }));
};

module.exports = (app) => {
  app.ws('/game', (client, request) => {
    client.id = clients.length
    clients.push(client);

    updateClient(client);

    client.on('message', (data) => {
      let x, y, z;
      
      const message = JSON.parse(data);
      switch (message.action) {
        case 'claim':
          if ((redPlayer && redPlayer.id === client.id) || (greenPlayer && greenPlayer.id === client.id)) return;
          switch (message.color) {
            case 'red':
              if (!!redPlayer) return;
              redPlayer = client;
              break;
            case 'green':
              if (!!greenPlayer) return;
              greenPlayer = client;
              break;
            default:
              return;
          }
          break;
        case 'play':
          switch (turn) {
            case 1:
              if (redPlayer.id !== client.id) return;
              [x, y, z] = message.position;
              if (gamestate[x][y][z] !== 0) return;
              gamestate[x][y][z] = 1;
              turn = 2;
              break;
            case 2:
              if (greenPlayer.id !== client.id) return;
              [x, y, z] = message.position;
              if (gamestate[x][y][z] !== 0) return;
              gamestate[x][y][z] = 2;
              turn = 1;
              break;
            default:
              throw 'turn must be 1 or 2';
          }
          break;
        case 'reset':
          resetting = true;
          reset();
          break;
        default:
          return;
      }
      
      clients.forEach((target) => {
        if (target.readyState === WebSocket.OPEN) {
          updateClient(target);
        }
      });
      
      resetting = false;
    });
  });
};