const redis = require('redis');

const client = redis.createClient({
  url: 'redis://127.0.0.1:6379'
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.connect();

module.exports = client;
