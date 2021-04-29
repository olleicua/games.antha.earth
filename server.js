const express = require("express");
const app = express();
require('express-ws')(app);

app.use(express.static("public"));
require('./routes.js').connect(app)

require('./chatWs.js')(app);
require('./gameWs.js')(app);

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});