const express = require("express");
const app = express();
const WebSocket = require('ws');
var expressWs = require('express-ws')(app);

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
//app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/views/index.html");
// });

// // send the default array of dreams to the webpage
// app.get("/dreams", (request, response) => {
//   // express helps us take JS objects and send them as JSON
//   response.json(dreams);
// });

require('./staticRoutes.js').connect(app)

// CHAT

//const WebSocket = require('ws');

// starts server instance on http://localhost:8080
const wss = expressWs.getWss();

// waits for connection to be established from the client
// the callback argument ws is a unique for each client
app.ws('/', (ws, request) => {
//wss.on('connection', (ws) => {

  // runs a callback on message event
  ws.on('message', (data) => {

    // sends the data to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send([data, wss.clients.length]);
        }
    });
  });
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});