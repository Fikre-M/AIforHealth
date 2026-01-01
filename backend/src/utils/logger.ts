// backend/src/utils/logger.ts
import winston from "winston";
import { env } from "@/config/env";

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length
    ? `\n${JSON.stringify(meta, null, 2)}`
    : "";
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    align(),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});

// Create a stream for morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
