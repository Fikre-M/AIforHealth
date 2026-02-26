import * as jwt from 'jsonwebtoken';
import { redisClient } from '@/config/redis';

interface TokenPayload {
  userId: string;
  role: string;
  email?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenService {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  /**
   * Generate access and refresh tokens for a user
   */
  static async generateTokens(user: any): Promise<TokenPair> {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
      algorithm: 'HS256'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256'
    } as jwt.SignOptions);

    // Store refresh token in Redis with 7 day expiry
    await redisClient.setEx(`refresh_token:${refreshToken}`, 7 * 24 * 60 * 60, user._id.toString());

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256']
      } as jwt.VerifyOptions) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
        algorithms: ['HS256']
      } as jwt.VerifyOptions) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(token: string): Promise<void> {
    await redisClient.del(`refresh_token:${token}`);
  }

  /**
   * Check if refresh token is valid in Redis
   */
  static async isRefreshTokenValid(token: string): Promise<boolean> {
    const userId = await redisClient.get(`refresh_token:${token}`);
    return userId !== null;
  }
}
