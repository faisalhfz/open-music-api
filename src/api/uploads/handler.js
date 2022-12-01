require('dotenv').config();

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postImageHandler({ payload }, h) {
    const { data } = payload;

    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._service.writeFile(data, data.hapi);

    const filepath = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    // await this._service.addFileToDatabase(filename, 'image', filepath);

    return h
      .response({
        status: 'success',
        message: 'Upload berhasil',
        data: {
          pictureUrl: filepath,
        },
      })
      .code(201);
  }
}

module.exports = UploadsHandler;
