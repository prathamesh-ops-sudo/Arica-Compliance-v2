import express from 'express';
import { createServer } from 'http';
import { config } from './config';
import { corsMiddleware, errorHandler, requestLogger, log } from './middleware';
import { registerApiRoutes } from './routes';
import { serveStatic } from './static';
import { initializeStorage } from './db';

const app = express();
const httpServer = createServer(app);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(corsMiddleware);

app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(requestLogger);

registerApiRoutes(app);

app.use(errorHandler);

(async () => {
  await initializeStorage();

  if (config.isProduction) {
    serveStatic(app);
  } else {
    const { setupVite } = await import('./vite');
    await setupVite(httpServer, app);
  }

  httpServer.listen(
    {
      port: config.port,
      host: '0.0.0.0',
      reusePort: true,
    },
    () => {
      log(`Server running on port ${config.port}`);
      log(`Environment: ${config.nodeEnv}`);
    },
  );
})();

export { app, httpServer, log };
