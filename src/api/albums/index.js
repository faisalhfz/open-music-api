const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (
    server,
    { albumService, albumsValidator, storageService, uploadsValidator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      albumService,
      albumsValidator,
      storageService,
      uploadsValidator
    );

    server.route(routes(albumsHandler));
  },
};
