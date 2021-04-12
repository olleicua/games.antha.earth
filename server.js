const express = require("express");
const app = express();
const WebSocket = require('ws');
var expressWs = require('express-ws')(app);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

require('./staticRoutes.js').connect(app)

// CHAT
const messages = [];
const clients = [];

// starts websocket server instance on http://localhost:8080
const wss = expressWs.getWss();

app.ws('/', (client, request) => {
  client.id = clients.length;
  clients.push(client);

  client.on('message', (data) => {

    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            message: data,
            clients: clients,
          }));
        }
    });
  });
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});