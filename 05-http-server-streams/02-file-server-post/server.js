const fs = require('fs');
const url = require('url');
const http = require('http');
const path = require('path');
const LimitSizeStream = require('./LimitSizeStream');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const FILE_LIMIT_SIZE = 1000000;

  if (pathname.indexOf('/') !== -1 || pathname.indexOf('..') !== -1) {
    res.statusCode = 400;
    res.end('Bad request');
  }

  const filepath = path.join(__dirname, 'files', pathname);

  switch (req.method) {
    case 'POST':

      const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
      const limitSizeStream = new LimitSizeStream({limit: FILE_LIMIT_SIZE});

      req.pipe(limitSizeStream).pipe(writeStream);

      limitSizeStream
          .on('error', (error) => {
            res.statusCode = 413;
            fs.unlink(filepath, (error) => {
              if (error) {
                // console.log('limitSizeStream->LIMIT_EXCEEDED->error', error);
              }
            });
            res.end('Big file');
          });

      writeStream
          .on('error', (error) => {
            // console.log('writeStream->error', error);
            if (error.code === 'EEXIST') {
              res.statusCode = 409;
              res.end('File exists');
            } else {
              res.statusCode = 500;
              res.end('Internal server error');
              fs.unlink(filepath, (error) => {
                // console.log('writeStream->fs.unlink->error', error);
              });
            }
          })
          .on('close', () => {
            res.statusCode = 201;
            res.end('saved!');
          });

      res.on('close', () => {
        if (res.finished) {
          return;
        }

        fs.unlink(filepath, (error) => {
          // console.log('res->fs.unlink->error', error);
        });
      });

      break;

    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
