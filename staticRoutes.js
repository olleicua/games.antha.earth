const routes = [
  ['/', '/views/index.html'],
  ['/chat', '/views/index.html'],
];

module.exports = {
  connect: (app) => {
    let i, requestedPath, staticFilePath;
    for (i = 0; i < routes.length; i++) {
      [requestedPath, staticFilePath] = routes[i];
      app.get(requestedPath, (request, response) => {
        response.html()
        //response.sendFile(__dirname + staticFilePath);
      });
    }
  }
};
