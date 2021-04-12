const express = require("express");
const app = express();
const WebSocket = require('ws');
var expressWs = require('express-ws')(app);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

require('./staticRoutes.js').connect(app)

// CHAT

// starts websocket server instance on http://localhost:8080
const wss = expressWs.getWss();

// waits for connection to be established from the client
// the callback argument ws is a unique for each client
app.ws('/', (client, request) => {
//wss.on('connection', (ws) => {

  // runs a callback on message event
  ws.on('message', (data) => {

    // sends the data to all connected clients
    let clients = [];
    wss.clients.forEach((client) => { clients.push(client); });
    wss.clients.forEach((client) => {
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