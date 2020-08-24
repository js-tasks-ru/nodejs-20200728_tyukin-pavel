const fs = require('fs');
const url = require('url');
const http = require('http');
const path = require('path');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  if (~pathname.indexOf('/') || ~pathname.indexOf('..')) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'DELETE':

      if (!filepath) {
        res.statusCode = 404;
        res.end('File not found');
        return;
      }

      fs.unlink(filepath, (error) => {
        // console.error('error', fs.unlink);
        if (error) {
          if (error.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('File not found');
          } else {
            res.statusCode = 500;
            res.end('Internal server error');
          }
        } else {
          res.statusCode = 200;
          res.end('deleted');
        }
      });
      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
