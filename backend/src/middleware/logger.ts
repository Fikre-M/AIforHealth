import morgan from 'morgan';
import { env, isProduction } from '@/config/env';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom format for development
const devFormat = ':method :url :status :res[content-length] - :response-time-ms';

// Custom format for production (more detailed)
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time-ms';

const logger = morgan(isProduction ? prodFormat : devFormat, {
  skip: (req, res) => {
    // Skip logging for health checks in production
    if (isProduction && req.url === '/health') {
      return true;
    }
    return false;
  },
});

export default logger;