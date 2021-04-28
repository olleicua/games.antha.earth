const WebSocket = require('ws');

const clients = [];

const gamestate = [];
for (let x = 0; x < 4; x ++) {
  gamestate.push([]);
  for (let y = 0; y < 4; y ++) {
    gamestate[x].push([]);
    for (let z = 0; z < 4; z ++) {
      gamestate[x][y].push(0);
    }
  }
}
let redPlayer = null;
let greenPlayer = null;

module.exports = (app) => {
  app.ws('/chat', (client, request) => {
    //client.id = clients.length
    clients.push(client);

    client.send(JSON.stringify(messages));

    client.on('message', (data) => {
      const message = JSON.parse(data);
      messages.push(message);

      clients.forEach((target) => {
        if (target.readyState === WebSocket.OPEN) {
          target.send(JSON.stringify([message]));
        }
      });
    });
  });
};