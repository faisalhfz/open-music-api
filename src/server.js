// path
const path = require('path');

// hapi
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');

// errors
const ClientError = require('./exceptions/ClientError');

// albums
const albums = require('./api/albums');
const AlbumService = require('./services/AlbumService');
const AlbumsValidator = require('./validator/albums');

// songs
const songs = require('./api/songs');
const SongService = require('./services/SongService');
const SongsValidator = require('./validator/songs');

// playlists
const playlists = require('./api/playlists');
const PlaylistService = require('./services/PlaylistService');
const PlaylistsValidator = require('./validator/playlists');

// users
const users = require('./api/users');
const UserService = require('./services/UserService');
const UsersValidator = require('./validator/users');

// authentications
const TokenManager = require('./tokenize/TokenManager');
const authentications = require('./api/authentications');
const AuthenticationService = require('./services/AuthenticationService');
const AuthenticationsValidator = require('./validator/authentications');

// collaborations
const collaborations = require('./api/collaborations');
const CollaborationService = require('./services/CollaborationService');
const CollaborationsValidator = require('./validator/collaborations');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/ProducerService');
const ExportsValidator = require('./validator/exports');

// storage
const StorageService = require('./services/StorageService');
const UploadsValidator = require('./validator/uploads');

// cache
const CacheService = require('./services/CacheService');

// config for env variables
const config = require('./utils/config');

// initializing server
const init = async () => {
  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // external plugins
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // authorization schema
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.jwt.accessTokenKey,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.jwt.accessTokenAge,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // initializing services
  const cacheService = new CacheService();
  const albumService = new AlbumService(cacheService);
  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const collaborationService = new CollaborationService();
  const playlistService = new PlaylistService(
    songService,
    collaborationService
  );
  const storageService = new StorageService(
    path.join(__dirname, 'files', 'covers')
  );

  // plugins registration
  await server.register([
    {
      plugin: albums,
      options: {
        albumService,
        albumsValidator: AlbumsValidator,
        storageService,
        uploadsValidator: UploadsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        producerService: ProducerService,
        playlistService,
        validator: ExportsValidator,
      },
    },
  ]);

  // pre-response error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
