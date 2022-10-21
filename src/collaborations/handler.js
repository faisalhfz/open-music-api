class CollaborationHandler {
  constructor(collaborationService, playlistService, validator) {
    this._collaborationService = collaborationService;
    this._playlistService = playlistService;
    this._validator = validator;
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    const collaborationId = await this._collaborationService.addCollaboration({
      playlistId,
      userId,
    });

    return h
      .response({
        status: 'success',
        data: {
          collaborationId,
        },
      })
      .code(201);
  }

  async deleteCollaborationHandler(request) {
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

    await this._collaborationService.deleteCollaboration({
      playlistId,
      userId,
    });

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  }
}

module.exports = CollaborationHandler;
