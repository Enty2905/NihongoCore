import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { configureApp } from '../src/common/configure-app';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'postgresql://nihongocore_dev:local_development_only@localhost:15432/nihongocore_dev?schema=public';
process.env.CORS_ORIGINS = 'http://localhost:8081';
process.env.JWT_ACCESS_SECRET =
  'test-access-secret-at-least-thirty-two-characters';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-secret-at-least-thirty-two-characters';
process.env.AUTH_ARGON2_MEMORY_KIB = '8192';
process.env.AUTH_ARGON2_TIME_COST = '1';
process.env.AUTH_ARGON2_PARALLELISM = '1';
process.env.AUTH_THROTTLE_TTL_MS = '60000';
process.env.AUTH_THROTTLE_LIMIT = '2';

describe('Authentication throttling', () => {
  let app: INestApplication;
  let baseUrl: string;

  before(async () => {
    const { AppModule } = await import('../src/app.module');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  after(async () => {
    await app?.close();
  });

  it('rate limits repeated Login attempts with the stable error envelope', async () => {
    const statuses: number[] = [];
    let lastBody: { statusCode: number; code: string } | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(baseUrl + '/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Platform': 'native',
        },
        body: JSON.stringify({
          email: 'rate-limit-missing@auth.test',
          password: 'a sufficiently long password',
        }),
      });
      statuses.push(response.status);
      lastBody = (await response.json()) as {
        statusCode: number;
        code: string;
      };
    }
    assert.deepEqual(statuses, [401, 401, 429]);
    assert.equal(lastBody?.statusCode, 429);
    assert.equal(lastBody?.code, 'TOO_MANY_REQUESTS');
  });
});
