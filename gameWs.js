const WebSocket = require('ws');

const clients = [];

const gamestate = [];
let turn = null;

const reset = () => {
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

const updateClient = (client) => {
  client.send(JSON.stringify({
    gamestate,
    turn,
    red: !redPlayer ? 'available' : redPlayer.id === client.id ? 'you' : 'someone',
    green: !greenPlayer ? 'available' : greenPlayer.id === client.id ? 'you' : 'someone',
  }));
};

module.exports = (app) => {
  app.ws('/game', (client, request) => {
    client.id = clients.length
    clients.push(client);

    updateClient(client);

    client.on('message', (data) => {
      
      const message = JSON.parse(data);
      switch (message.action) {
        case 'claim':
          if (redPlayer.id === client.id || greenPlayer.id === client.id) return;
          switch (message.color) {
            case 'red':
              if (!!redPlayer) return;
              redPlayer = client;
              break;
            case 'green':
              if (!!greenPlayer) return;
              greenPlayer = client;
              break;
          }
          break;
        case 'play':
          break;
        case 'reset':
          break;
        default:
          return;
      }
      
      
      
      messages.push(message);

      clients.forEach((target) => {
        if (target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify([message]));
        }
      });
    });
  });
};