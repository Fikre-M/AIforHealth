import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

// HTTPS enforcement middleware
export const enforceHttps = (req: Request, res: Response, next: NextFunction) => {
  // Skip in development or if already HTTPS
  if (process.env.NODE_ENV !== 'production' || req.secure) {
    return next();
  }

  // Check if forwarded protocol is HTTPS (for proxy setups)
  const forwardedProto = req.header('x-forwarded-proto');
  if (forwardedProto === 'https') {
    return next();
  }

  // Redirect to HTTPS
  const host = req.header('host');
  const httpsUrl = `https://${host}${req.url}`;

  logger.info('Redirecting to HTTPS', {
    from: `${req.protocol}://${host}${req.url}`,
    to: httpsUrl,
  });

  res.redirect(301, httpsUrl);
};

// HSTS preload list submission helper
export const hstsPreloadCheck = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    // Check if domain is eligible for HSTS preload
    const hstsHeader = res.getHeader('Strict-Transport-Security');
    if (hstsHeader) {
      const hstsValue = hstsHeader.toString();
      if (
        hstsValue.includes('max-age=31536000') &&
        hstsValue.includes('includeSubDomains') &&
        hstsValue.includes('preload')
      ) {
        // Domain is eligible for preload
        logger.info('Domain eligible for HSTS preload');
      }
    }
  }
  next();
};

// Certificate transparency monitoring
export const monitorCertificate = (req: Request, res: Response, next: NextFunction) => {
  if (req.secure) {
    const sslCertificate = req.socket.getPeerCertificate();

    // Check certificate expiration
    if (sslCertificate && sslCertificate.valid_to) {
      const expiryDate = new Date(sslCertificate.valid_to);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry < 30) {
        logger.warn(`SSL certificate expires in ${daysUntilExpiry} days`, {
          daysLeft: daysUntilExpiry,
          expiryDate: expiryDate.toISOString(),
        });

        // Alert if less than 7 days
        if (daysUntilExpiry < 7) {
          // Send alert to admin
          // alertAdmins('SSL_CERTIFICATE_EXPIRING', { daysUntilExpiry });
        }
      }
    }
  }

  next();
};
