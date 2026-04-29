/**
 * Keep-alive utility to prevent Render free tier from spinning down
 * and MongoDB Atlas M0 from pausing due to inactivity.
 *
 * Pings the /health endpoint every 10 minutes in production.
 */

const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const HEALTH_URL = process.env.RENDER_EXTERNAL_URL
  ? `${process.env.RENDER_EXTERNAL_URL}/health`
  : null;

let intervalId: ReturnType<typeof setInterval> | null = null;

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

export function startKeepAlive(): void {
  if (process.env.NODE_ENV !== 'production') return;

  if (!HEALTH_URL) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Keep-alive: RENDER_EXTERNAL_URL not set, skipping self-ping.');
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`🏓 Keep-alive started — pinging every ${PING_INTERVAL_MS / 60000} minutes`);
  intervalId = setInterval(() => {
    void ping();
  }, PING_INTERVAL_MS);

  // Unref so the interval doesn't block graceful shutdown
  intervalId.unref();
}

export function stopKeepAlive(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    // eslint-disable-next-line no-console
    console.log('🏓 Keep-alive stopped');
  }
}
