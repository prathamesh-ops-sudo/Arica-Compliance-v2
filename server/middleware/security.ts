import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { type Express } from 'express';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.amazonaws.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: true,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    error: true,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    error: true,
    message: 'API rate limit exceeded, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export function applySecurityMiddleware(app: Express): void {
  app.disable('x-powered-by');
  app.use(helmetMiddleware);
  app.use(globalRateLimiter);
}
