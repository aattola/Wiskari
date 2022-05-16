import * as Sentry from '@sentry/node';
// @ts-ignore
import * as Tracking from '@sentry/tracing';
import os from 'os';

const dev = process.env.NODE_ENV;

Sentry.init({
  dsn:
    'https://e2000eaed1d24f299bd0b96739e0e1a2@o124657.ingest.sentry.io/5919041',
  release: 'wiskari-bot',
  environment: dev,
  serverName: `wiskari-bot@${os.hostname()}`,
  tracesSampleRate: 1.0,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
});

export { Sentry };
