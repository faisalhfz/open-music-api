const path = require('path');

const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/images',
    handler: (request, h) => handler.postImageHandler(request, h),
    options: {
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        multipart: true,
        maxBytes: 0.5 * 1024 * 1024,
      },
    },
  },
  {
    method: 'GET',
    path: '/upload/{file*}',
    handler: {
      directory: {
        path: path.join(__dirname, '..', '..', 'files'),
      },
    },
  },
];

module.exports = routes;
