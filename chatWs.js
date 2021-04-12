const WebSocket = require('ws');

const messages = [];
const clients = [];

module.exports = (app) => {
  const expressWs = require('express-ws')(app);

  app.ws('/chat', (client, request) => {
    //client.id = clients.length
    clients.push(client);

    client.send(JSON.stringify(messages));

    client.on('message', (data) => {
      console.log(data);
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