// default config
module.exports = {
  workers: 1,
  jwt: {
    secret: 'aabbccdd123',
    cookie: 'jwt-token',
    expire: 30 // 秒
  },
};
