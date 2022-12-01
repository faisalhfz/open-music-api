class ExportsHandler {
  constructor(producerService, playlistService, validator) {
    this._producerService = producerService;
    this._playlistService = playlistService;
    this._validator = validator;
  }

  async postExportPlaylistHandler({ params, payload, auth }, h) {
    this._validator.validateExportPlaylistPayload(payload);

    const { id: playlistId } = params;
    const { id: credentialId } = auth.credentials;

    await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

    await this._playlistService.getPlaylistById(playlistId);

    const message = {
      playlistId,
      targetEmail: payload.targetEmail,
    };

    await this._producerService.sendMessage(
      'export:playlist',
      JSON.stringify(message)
    );

    return h
      .response({
        status: 'success',
        message: 'Permintaan dalam antrean',
      })
      .code(201);
  }
}

module.exports = ExportsHandler;
