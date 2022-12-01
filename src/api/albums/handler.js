class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postAlbumHandler({ payload }, h) {
    this._validator.validateAlbumPayload(payload);

    const albumId = await this._service.addAlbum(payload);

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

    const album = await this._service.getAlbumById(id);

    const songs = await this._service.getSongsByAlbumId(id);

    if (!songs.length) {
      return {
        status: 'success',
        data: {
          album,
        },
      };
    }

    return {
      status: 'success',
      data: {
        album: { ...album, songs },
      },
    };
  }

  async putAlbumByIdHandler({ params, payload }) {
    this._validator.validateAlbumPayload(payload);

    const { id } = params;

    await this._service.editAlbumById(id, payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler({ params }) {
    const { id } = params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }
}

module.exports = AlbumsHandler;
