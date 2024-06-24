import fs from 'fs';
import cors from 'cors';
import http from 'http';
import https from 'https';
import dotenv from "dotenv";
import express from 'express';
import { Sleep } from "./util.js";
import { WebSocketServer } from 'ws';
import bodyParser from 'body-parser';
import router from './routes/auth.js';
import typeDefs from './graphql/schema.js';
import dbIndex from './data-model/index.js';
import { ApolloServer } from '@apollo/server';
import resolvers from './graphql/resolvers.js';
import loginCheck from './routes/loginCheck.js';
import { makeServer, CloseCode } from 'graphql-ws';
import { expressMiddleware } from '@apollo/server/express4';
import { passport, passportCfg } from './passport-config.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
dotenv.config();

const SSL_ON = process.env.SSL_ON;
const HOSTNAME = process.env.HOST;
const SSL_KEY = process.env.SSL_KEY;
const SSL_CERT = process.env.SSL_CERT;
const DEV_MODE = process.env.DEV_MODE;
const SERVER_PORT = process.env.LISTENING_PORT;
const SERVER_HOST = process.env.LISTENING_ADDR;
const UPLOAD_SIZE_LIMIT = process.env.UPLOAD_SIZE_LIMIT;

global.subIDs = [];
let httpServer = null;


if (DEV_MODE === 'true') {
  console.log('❌❌❌❌❌❌❌❌❌❌❌\n\n\n>>>--- DEV_MODE ---<<<\n\n\n❌❌❌❌❌❌❌❌❌❌❌\n\n');
}


const connect_DB = () => {
  return new Promise((resolve) => {
    dbIndex.init()
      .then(result => resolve(true))
      .catch(error => {
        console.error(error);
        resolve(false);
      });
  })
}


try {
  let dbResult = false;
  do {
    dbResult = await connect_DB();
    if (!dbResult) {
      console.error('\n DB Connection Failed... \n');
      await Sleep(10_000);
    }
  } while (!dbResult);
} catch (error) {
  console.error(error)
}


const app = express();


if (SSL_ON === 'true') {
  console.log("✅ SSL Enabled");
  var privateKey = fs.readFileSync(SSL_KEY);
  var certificate = fs.readFileSync(SSL_CERT);
  httpServer = https.createServer({
    key: privateKey,
    cert: certificate
  }, app);

} else {
  httpServer = http.createServer({
  }, app);
}

const schema = makeExecutableSchema({
  typeDefs: [typeDefs, typeDefs],
  resolvers: [resolvers, resolvers],
});


// Create the WebSocket server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/',
});

// Create the graphql server
const gqlServer = makeServer({
  schema,
  onConnect: async (ctx) => {
    // console.log('---------->>> Connected!');
    // do your auth on every connect (recommended)
    // await handleAuth(ctx.extra.request);
  },
  onSubscribe: async (ctx) => {
    // console.log('---------->>> onSubscribe!');
    // await handleAuth(ctx.extra.request);
  },
});




wsServer.on('connection', (socket, request) => {
  const closed = gqlServer.opened({
    protocol: socket.protocol,
    send: (data) =>
      new Promise((resolve, reject) => {
        socket.send(data, (err) => (err ? reject(err) : resolve()));
      }),
    close: (code, reason) => socket.close(code, reason), // for standard closures
    onMessage: (cb) => {
      socket.on('message', async (event) => {
        try {
          const evData = JSON.parse(event.toString());
          if (typeof evData.id != 'undefined') {
            if (evData.type == 'subscribe') {
              subIDs.push({
                id: evData.id,
                type: evData.type,
                state: null,
              });
            } else if (evData.type == 'complete') {
              let index = subIDs.findIndex(item => item.id == evData.id);
              subIDs.splice(index, 1);
            }
          }
          await cb(event.toString());
        } catch (err) {
          if (err) {
            // console.log('X+---------------------------------------------------- Breaking Old Connection: ', subIDs.length);
          } else {
            socket.close(CloseCode.InternalServerError, err.message);
          }
        }
      });
    },
  }, { request },);
  socket.once('close', (code, reason) => {
    console.log('socket - close');
    closed(code, reason)
  });
});


const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }), {
      async serverWillStart() {
        return {
          async drainServer() {
            // await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();


const loggingMiddleware = (req, res, next) => {
  // console.log("ip:", req.ip)
  next()
}

passportCfg(passport)
app.use(loggingMiddleware);
app.use(express.json({ limit: UPLOAD_SIZE_LIMIT }));
app.use(passport.initialize());

if (DEV_MODE === 'true') {
  app.use(
    '/',
    cors({ origin: '*' }),
    bodyParser.json({ limit: UPLOAD_SIZE_LIMIT }),
    // passport.authenticate('jwt', { session: false }), // <<< Turns on Auth
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );
} else {
  // app.use(
  //   '/auth', 
  //   cors({origin: [HOSTNAME+':3000', HOSTNAME+':'+SERVER_PORT, HOSTNAME]}),
  //   router
  // );
  // app.use(
  //   '/check',
  //   cors({origin: [HOSTNAME+':3000', HOSTNAME+':'+SERVER_PORT, HOSTNAME]}),
  //   passport.authenticate('jwt', { session: false }), // <<< Turns on Auth
  //   loginCheck
  // );
  app.use(
    '/',
    cors({ origin: [HOSTNAME + ':'+SERVER_PORT, HOSTNAME] }),
    bodyParser.json({ limit: UPLOAD_SIZE_LIMIT }),
    // passport.authenticate('jwt', { session: false }), // <<< Turns on Auth
    // expressMiddleware accepts the same arguments:
    // an Apollo Server instance and optional configuration options
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );
}

await new Promise((resolve) => httpServer.listen({ port: SERVER_PORT, host: SERVER_HOST }, resolve));
console.log(`🚀 Server ready at ${SERVER_HOST}:${SERVER_PORT}`);
console.log('Limit file size: ' + UPLOAD_SIZE_LIMIT);

