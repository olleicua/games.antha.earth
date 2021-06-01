const { ArgumentParser } = require('argparse');
const express = require("express");
const app = express();
require('express-ws')(app);

const parser = new ArgumentParser();
parser.add_argument('-p', '--port', { help: 'the port the server runs on',
                                      default: 5000,
                                      type: 'int' });
const FLAGS = parser.parse_args();

app.use(express.static("public"));
require('./routes.js').connect(app)

require('./chatWs.js')(app);
require('./gameWs.js')(app);

// listen for requests :)
const listener = app.listen(process.env.PORT || FLAGS.port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
