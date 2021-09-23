const blueBird = require('bluebird')
var redis =
  process.env.NODE_ENV === 'test' ? require('fakeredis') : require('redis')

blueBird.promisifyAll(redis)

module.exports = redis.createClient
