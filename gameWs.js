const WebSocket = require('ws');

const clients = [];

let gamestate = [];
let turn = null;
let redPlayer = null;
let greenPlayer = null;

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
  redPlayer = null;
  greenPlayer = null;
};
reset();

const checkClients = () => {
  let change = false;
  clients.forEach((target) => {
    if (target.lastPing < Date.now() - 10000 || target.readyState !== WebSocket.OPEN) {
      target.connected = false;
      change = true;
      if (redPlayer === target) redPlayer = null;
      if (greenPlayer === target) greenPlayer = null;
    }
  });
  return change;
};

const broadcast = () => {
  clients.forEach((target) => {
    if (target.lastPing < Date.now() - 10000 || target.readyState !== WebSocket.OPEN) {
      target.connected = false;
    }
  });
  clients.forEach((target) => {
    if (target.connected) {
      updateClient(target);
    }
  });
};

let resetting = false;
const updateClient = (client) => {
  client.send(JSON.stringify({
    gamestate,
    turn,
    red: !redPlayer ? 'available' : (redPlayer && (redPlayer.id === client.id)) ? 'you' : 'someone',
    green: !greenPlayer ? 'available' : (greenPlayer && (greenPlayer.id === client.id)) ? 'you' : 'someone',
    reset: resetting,
    connection_count: clients.filter(t => t.connected).length
  }));
};

module.exports = (app) => {
  app.ws('/game', (client, request) => {
    client.id = clients.length;
    client.connected = true;
    client.lastPing = Date.now();
    clients.push(client);

    broadcast();

    client.on('message', (data) => {
      let x, y, z;

      const message = JSON.parse(data);
      switch (message.action) {
        case 'claim':
          client.lastPing = Date.now();
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
          client.lastPing = Date.now();
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
          client.lastPing = Date.now();
          resetting = true;
          reset();
          break;
        case 'ping':
          client.lastPing = Date.now();
          if (checkClients()) updateClient(client);
          return;
        default:
          return;
      }
      
      broadcast();
      
      resetting = false;
    });
  });
};