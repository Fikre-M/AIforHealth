/**
 * Keep-alive utility to prevent Render free tier from spinning down
 * and MongoDB Atlas M0 from pausing due to inactivity.
 *
 * - Pings the /health endpoint every 10 minutes to keep Render awake.
 * - Pings MongoDB directly every 24 hours to prevent Atlas M0 auto-pause
 *   (Atlas pauses after 60 days of no DB activity).
 */

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const DB_PING_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

const HEALTH_URL = process.env.RENDER_EXTERNAL_URL
  ? `${process.env.RENDER_EXTERNAL_URL}/health`
  : null;

let intervalId: ReturnType<typeof setInterval> | null = null;
let dbIntervalId: ReturnType<typeof setInterval> | null = null;

async function ping(): Promise<void> {
  if (!HEALTH_URL) return;

  try {
    const res = await fetch(HEALTH_URL);
    // eslint-disable-next-line no-console
    console.log(`🏓 Keep-alive ping → ${HEALTH_URL} [${res.status}]`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Keep-alive ping failed:', error instanceof Error ? error.message : error);
  }
}

async function pingDatabase(): Promise<void> {
  try {
    // Inline import to avoid circular deps — database singleton is safe to re-import
    const { database } = await import('@/config/database');
    const healthy = await database.healthCheck();
    // eslint-disable-next-line no-console
    console.log(`🗄️  MongoDB keep-alive ping — ${healthy ? 'OK' : 'FAILED'}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      '⚠️  MongoDB keep-alive ping failed:',
      error instanceof Error ? error.message : error
    );
  }
}

export function startKeepAlive(): void {
  if (process.env.NODE_ENV !== 'production') return;

  if (!HEALTH_URL) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Keep-alive: RENDER_EXTERNAL_URL not set, skipping self-ping.');
  } else {
    // eslint-disable-next-line no-console
    console.log(`🏓 Keep-alive started — pinging every ${PING_INTERVAL_MS / 60000} minutes`);
    intervalId = setInterval(() => {
      void ping();
    }, PING_INTERVAL_MS);

    // Unref so the interval doesn't block graceful shutdown
    intervalId.unref();
  }

  // MongoDB keep-alive — ping DB every 24 hours to prevent Atlas M0 auto-pause
  // eslint-disable-next-line no-console
  console.log('🗄️  MongoDB keep-alive started — pinging every 24 hours');
  dbIntervalId = setInterval(() => {
    void pingDatabase();
  }, DB_PING_INTERVAL_MS);
  dbIntervalId.unref();
}

export function stopKeepAlive(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    // eslint-disable-next-line no-console
    console.log('🏓 Keep-alive stopped');
  }

  if (dbIntervalId) {
    clearInterval(dbIntervalId);
    dbIntervalId = null;
    // eslint-disable-next-line no-console
    console.log('🗄️  MongoDB keep-alive stopped');
  }
}
