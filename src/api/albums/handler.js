const config = require('../../utils/config');

class AlbumsHandler {
  constructor(albumService, albumsValidator, storageService, uploadsValidator) {
    this._albumService = albumService;
    this._albumsValidator = albumsValidator;
    this._storageService = storageService;
    this._uploadsValidator = uploadsValidator;
  }

  async postAlbumHandler({ payload }, h) {
    this._albumsValidator.validateAlbumPayload(payload);

    const albumId = await this._albumService.addAlbum(payload);

    return h
      .response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async getAlbumByIdHandler({ params }) {
    const { id } = params;

    const album = await this._albumService.getAlbumById(id);

    const songs = await this._albumService.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: { ...album, songs },
      },
    };
  }

  async putAlbumByIdHandler({ params, payload }) {
    this._albumsValidator.validateAlbumPayload(payload);

    const { id } = params;

    await this._albumService.editAlbumById(id, payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler({ params }) {
    const { id } = params;

    await this._albumService.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverHandler({ params, payload }, h) {
    const { id } = params;
    const { cover } = payload;

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const file = await this._storageService.writeFile(cover, cover.hapi);

    const coverUrl = `http://${config.app.host}:${config.app.port}/albums/${id}/covers/${file}`;

    await this._albumService.addAlbumCover(id, coverUrl);

    return h
      .response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      })
      .code(201);
  }

  async getAlbumLikesHandler({ params }, h) {
    const { id } = params;

    const { likes, cache } = await this._albumService.getAlbumLikes(id);

    if (cache) {
      return h
        .response({
          status: 'success',
          data: {
            likes,
          },
        })
        .header('X-Data-Source', 'cache');
    }
    return h.response({
      status: 'success',
      data: {
        likes,
      },
    });
  }

  async postAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: credentialsId } = request.auth.credentials;

    await this._albumService.getAlbumById(albumId);

    await this._albumService.userLikesAlbum(credentialsId, albumId);

    return h
      .response({
        status: 'success',
        message: 'Berhasil menyukai album',
      })
      .code(201);
  }

  async deleteAlbumLikesHandler(request) {
    const { id: albumId } = request.params;
    const { id: credentialsId } = request.auth.credentials;

    await this._albumService.getAlbumById(albumId);

    await this._albumService.userUnlikesAlbum(credentialsId, albumId);

    return {
      status: 'success',
      message: 'Batal menyukai album',
    };
  }
}

module.exports = AlbumsHandler;
