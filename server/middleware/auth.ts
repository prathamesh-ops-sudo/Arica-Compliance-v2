import { type Request, type Response, type NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    organizationId?: string;
    role?: string;
  };
}

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier && config.cognitoUserPoolId && config.cognitoClientId) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: config.cognitoUserPoolId,
      tokenUse: 'id',
      clientId: config.cognitoClientId,
    });
  }
  return verifier;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const jwtVerifier = getVerifier();
  
  if (!jwtVerifier) {
    console.log('Auth middleware: Cognito not configured, allowing request (dev mode)');
    req.user = {
      sub: 'dev-user',
      email: 'dev@example.com',
      organizationId: 'org-1',
      role: 'admin',
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: true,
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = await jwtVerifier.verify(token);
    
    req.user = {
      sub: payload.sub,
      email: payload.email as string,
      organizationId: payload['custom:organizationId'] as string | undefined,
      role: payload['custom:role'] as string | undefined,
    };
    
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({
      error: true,
      message: 'Invalid or expired token',
    });
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const jwtVerifier = getVerifier();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  if (!jwtVerifier) {
    req.user = {
      sub: 'dev-user',
      email: 'dev@example.com',
      organizationId: 'org-1',
      role: 'admin',
    };
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const payload = await jwtVerifier.verify(token);
    
    req.user = {
      sub: payload.sub,
      email: payload.email as string,
      organizationId: payload['custom:organizationId'] as string | undefined,
      role: payload['custom:role'] as string | undefined,
    };
  } catch (error) {
    console.log('Optional auth: token verification failed, continuing without auth');
  }
  
  next();
};

export type { AuthenticatedRequest };
