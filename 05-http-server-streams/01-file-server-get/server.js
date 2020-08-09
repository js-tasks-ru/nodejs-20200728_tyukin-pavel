const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const SpecificPathError = require('./SpecificPathError');

const server = new http.Server();

async function readFiles(req, res, directory, pathname) {
  const fileName = pathname.replace(/files\//ig, '');
  if (fileName.indexOf('/') >= 0) {
    res.statusCode = 400;
    throw new SpecificPathError();
  }

  const entities = await fs.readdir(directory);

  for (const entity of entities) {
    const stat = await fs.stat(path.join(directory, entity));
    if (!stat.isFile()) continue;
    const content = await fs.readFile(path.join(directory, entity));
    if (fileName === entity) {
      return {file: entity, content};
    }
  }

  res.statusCode = 404;
  res.write('Такого файла нет', 'utf8');
}

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);

  switch (req.method) {
    case 'GET':
      readFiles(req, res, path.join(__dirname, 'files'), pathname)
          .catch((error) => {
            console.log(error);
            switch (error.code) {
              case 'BAD_PATH':
                res.statusCode = 400;
                res.end('400');
                break;
              case 'ENOENT':
                res.statusCode = 404;
                res.end('404');
                break;
              default:
                res.statusCode = 500;
                res.end('500');
                break;
            }
          })
          .then((file) => {
            if (typeof file === 'undefined' || !file) {
              res.statusCode = 500;
              res.end('500');
              return;
            }

            res.write(file.content);
            res.end();
          });
      break;
    default:
      res.statusCode = 501;
      res.end('Not implemented');
  }
});

module.exports = server;
