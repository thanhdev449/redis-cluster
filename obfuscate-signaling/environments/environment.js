exports.configuration = {
  PORT: 8989,
  SSL: true,
  SSL_KEY: 'key.pem',
  SSL_CERT: 'cert.pem',
  SSL_CA: 'cert.pem',
  REDIS_SERVER: {
    host: '192.168.64.30',
    port: 6379,
    db: '0'
  },
  DB_SERVER:{
    host: 'localhost',
    port: 27017,
    db: 'vina'
  }
};