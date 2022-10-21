const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: (request, h) => handler.postUsersHandler(request, h),
  },
];

module.exports = routes;
