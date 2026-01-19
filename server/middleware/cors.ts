import { type Request, type Response, type NextFunction } from 'express';
import { config } from '../config';

const ALLOWED_ORIGINS = [
  'https://8amhmgsqgq.us-east-1.awsapprunner.com',
  'https://hdqnvk4mnm.us-east-1.awsapprunner.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestOrigin = req.headers.origin;
  
  let allowedOrigin = config.corsOrigin;
  
  if (config.isProduction) {
    if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
      allowedOrigin = requestOrigin;
    } else if (requestOrigin) {
      allowedOrigin = ALLOWED_ORIGINS[0];
    }
  } else {
    allowedOrigin = requestOrigin || '*';
  }
  
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
}
