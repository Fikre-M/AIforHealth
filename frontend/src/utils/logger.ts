import { config } from '@/config/env';

// Log levels
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: any;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  constructor() {
    this.logLevel = config.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${levelName}: ${message}${metaStr}`;
  }

  private addLog(level: LogLevel, message: string, meta?: any, error?: Error): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      meta,
      stack: error?.stack,
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  error(message: string, error?: Error, meta?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    this.addLog(LogLevel.ERROR, message, meta, error);
    
    if (config.isDevelopment) {
      console.error(this.formatMessage(LogLevel.ERROR, message, meta), error);
    } else {
      console.error(message, error);
    }

    // Send to error monitoring service in production
    if (config.isProduction && config.services.sentryDsn) {
      this.sendToSentry('error', message, error, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    this.addLog(LogLevel.WARN, message, meta);
    
    if (config.isDevelopment) {
      console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    } else {
      console.warn(message);
    }
  }

  info(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    this.addLog(LogLevel.INFO, message, meta);
    
    if (config.isDevelopment) {
      console.info(this.formatMessage(LogLevel.INFO, message, meta));
    } else {
      console.info(message);
    }
  }

  debug(message: string, meta?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    this.addLog(LogLevel.DEBUG, message, meta);
    
    if (config.isDevelopment) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  // Get recent logs for debugging
  getLogs(count = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Send to Sentry (placeholder for now)
  private sendToSentry(level: string, message: string, error?: Error, meta?: any): void {
    // This would integrate with Sentry SDK
    // For now, just log to console in production
    console.error('Sentry:', { level, message, error: error?.message, meta });
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Convenience functions
export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, error, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// API logging helpers
export const logApi = {
  request: (method: string, url: string, data?: any) => {
    logger.debug('📤 API Request', { method, url, data });
  },
  response: (method: string, url: string, status: number, data?: any) => {
    logger.debug('📥 API Response', { method, url, status, data });
  },
  error: (method: string, url: string, error: Error) => {
    logger.error('💥 API Error', error, { method, url });
  },
};

// User action logging
export const logUser = {
  action: (action: string, details?: any) => {
    logger.info('👤 User Action', { action, ...details });
  },
  navigation: (from: string, to: string) => {
    logger.debug('🧭 Navigation', { from, to });
  },
  error: (action: string, error: Error) => {
    logger.error('❌ User Action Error', error, { action });
  },
};

// Performance logging
export const logPerformance = {
  timing: (name: string, duration: number) => {
    logger.debug('⏱️ Performance', { name, duration });
  },
  mark: (name: string) => {
    if (performance && performance.mark) {
      performance.mark(name);
    }
    logger.debug('📍 Performance Mark', { name });
  },
  measure: (name: string, startMark: string, endMark: string) => {
    if (performance && performance.measure) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      logger.debug('📏 Performance Measure', { name, duration: measure.duration });
    }
  },
};

export default logger;