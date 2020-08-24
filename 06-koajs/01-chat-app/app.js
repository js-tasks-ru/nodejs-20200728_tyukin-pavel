const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();
let users = [];

router.get('/subscribe', async (ctx, next) => {
  const message = await new Promise((resolve) =>{
    users.push(resolve);
  });

  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!message) {
    ctx.throw(400, 'not "message"');
  }

  for (const user of users) {
    user(message);
  }

  users = [];
  ctx.body = 'OK';
});

app.use(router.routes());

module.exports = app;
