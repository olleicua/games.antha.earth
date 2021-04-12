const app = require('./app.js');

const routes = [
  ['/', '/views/index.html'],
  ['/chat', '/views/index.html'],
];

module.exports = {
  listen: 
};

for (var i = 0; i < routes.length; i++) {
  var requestedPath, staticFilePath;
  [requestedPath, staticFilePath] = routes[i];
  app.get(requestedPath, (request, response) => {
    response.sendFile(__dirname + staticFilePath);
  });
}
