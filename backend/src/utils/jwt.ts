import * as jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { JWTPayload, UserRole } from '@/types';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT utility functions for token generation and verification
 */
export class JwtUtil {
  private static secret = env.JWT_SECRET;
  private static refreshSecret = env.JWT_REFRESH_SECRET;

  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.secret,
      {
        expiresIn: env.JWT_EXPIRES_IN,
        algorithm: 'HS256',
        issuer: 'aiforhealth-api',
        audience: 'aiforhealth-client',
      } as jwt.SignOptions
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.refreshSecret,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        algorithm: 'HS256',
        issuer: 'aiforhealth-api',
        audience: 'aiforhealth-client',
      } as jwt.SignOptions
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'aiforhealth-api',
        audience: 'aiforhealth-client',
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      // Convert to our JWTPayload format
      return {
        userId: decoded.userId as string,
        email: decoded.email as string,
        role: decoded.role as UserRole,
        iat: decoded.iat || 0,
        exp: decoded.exp || 0,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        issuer: 'aiforhealth-api',
        audience: 'aiforhealth-client',
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;

      // Convert to our JWTPayload format
      return {
        userId: decoded.userId as string,
        email: decoded.email as string,
        role: decoded.role as UserRole,
        iat: decoded.iat || 0,
        exp: decoded.exp || 0,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): jwt.JwtPayload | null {
    return jwt.decode(token) as jwt.JwtPayload;
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }
}