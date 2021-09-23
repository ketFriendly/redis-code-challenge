require('dotenv').config()
const http = require('http')
const app = require('../src/index')

const port = process.env.PORT || 8080

const server = http.createServer(app);

(() => {
  if (process.env.NODE_ENV !== 'test') {
    server.listen(port, () => console.log('Server listening'))
  }
})()

module.exports = function createServer () {
  return server
}

