import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { setAuthTokenGetter } from './api';

const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || '';

const userPool = COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID
  ? new CognitoUserPool({
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_CLIENT_ID,
    })
  : null;

interface User {
  email: string;
  name?: string;
  organizationId?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  confirmSignup: (email: string, code: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentUser = useCallback((): Promise<User | null> => {
    return new Promise((resolve) => {
      if (!userPool) {
        resolve(null);
        return;
      }

      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }

        cognitoUser.getUserAttributes((attrErr, attributes) => {
          if (attrErr || !attributes) {
            resolve(null);
            return;
          }

          const userAttrs: Record<string, string> = {};
          attributes.forEach((attr) => {
            userAttrs[attr.getName()] = attr.getValue();
          });

          resolve({
            email: userAttrs.email || '',
            name: userAttrs.name || userAttrs['custom:fullname'],
            organizationId: userAttrs['custom:organizationId'],
            role: userAttrs['custom:role'],
          });
        });
      });
    });
  }, []);

  useEffect(() => {
    setAuthTokenGetter(getIdToken);
    
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [getCurrentUser]);

  const login = async (email: string, password: string): Promise<void> => {
    if (!userPool) {
      throw new Error('Authentication not configured');
    }

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async () => {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          resolve();
        },
        onFailure: (err) => {
          reject(new Error(err.message || 'Login failed'));
        },
        newPasswordRequired: () => {
          reject(new Error('Password change required'));
        },
      });
    });
  };

  const signup = async (email: string, password: string, name?: string): Promise<void> => {
    if (!userPool) {
      throw new Error('Authentication not configured');
    }

    return new Promise((resolve, reject) => {
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({ Name: 'email', Value: email }),
      ];

      if (name) {
        attributeList.push(new CognitoUserAttribute({ Name: 'name', Value: name }));
      }

      userPool.signUp(email, password, attributeList, [], (err) => {
        if (err) {
          reject(new Error(err.message || 'Signup failed'));
          return;
        }
        resolve();
      });
    });
  };

  const confirmSignup = async (email: string, code: string): Promise<void> => {
    if (!userPool) {
      throw new Error('Authentication not configured');
    }

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) {
          reject(new Error(err.message || 'Confirmation failed'));
          return;
        }
        resolve();
      });
    });
  };

  const logout = () => {
    if (!userPool) return;

    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    setUser(null);
  };

  const forgotPassword = async (email: string): Promise<void> => {
    if (!userPool) {
      throw new Error('Authentication not configured');
    }

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => resolve(),
        onFailure: (err) => reject(new Error(err.message || 'Failed to send reset code')),
      });
    });
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    if (!userPool) {
      throw new Error('Authentication not configured');
    }

    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => resolve(),
        onFailure: (err) => reject(new Error(err.message || 'Failed to reset password')),
      });
    });
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!userPool) return null;

    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session || !session.isValid()) {
          resolve(null);
          return;
        }
        resolve(session.getIdToken().getJwtToken());
      });
    });
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    confirmSignup,
    forgotPassword,
    resetPassword,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}
