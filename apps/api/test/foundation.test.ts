import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';
import { Body, Controller, Get, INestApplication, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { IsNotEmpty, IsString } from 'class-validator';
import { configureApp } from '../src/common/configure-app';
import { validateEnvironment } from '../src/common/environment';
import { HealthModule } from '../src/health/health.module';

class ProbeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

// Test-only endpoints exercise the same global HTTP configuration as main.ts.
@Controller('probe')
class ProbeController {
  @Post()
  submit(@Body() dto: ProbeDto) {
    return dto;
  }

  @Get('failure')
  failure() {
    throw new Error('do-not-expose-password-or-token');
  }
}

async function startApp(mode: 'development' | 'production') {
  const config = validateEnvironment({
    NODE_ENV: mode,
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    CORS_ORIGINS: 'http://localhost:8081',
  });
  const module = await Test.createTestingModule({
    imports: [HealthModule],
    controllers: [ProbeController],
    providers: [
      { provide: ConfigService, useValue: new ConfigService(config) },
    ],
  }).compile();
  const app = module.createNestApplication({ logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  return app;
}

describe('HTTP foundation', () => {
  let app: INestApplication;
  let baseUrl: string;
  before(async () => {
    app = await startApp('development');
    baseUrl = await app.getUrl();
  });
  after(async () => {
    await app?.close();
  });

  it('serves the public health contract at the versioned route', async () => {
    const response = await fetch(baseUrl + '/api/v1/health');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
  });

  it('does not expose an unversioned health route and uses stable errors', async () => {
    const response = await fetch(baseUrl + '/health');
    assert.equal(response.status, 404);
    const body = (await response.json()) as Record<string, unknown>;
    assert.equal(body.code, 'NOT_FOUND');
    assert.equal(body.statusCode, 404);
    assert.equal(typeof body.message, 'string');
    assert.deepEqual(body.details, {});
  });

  it('publishes the health contract through development OpenAPI and Swagger UI', async () => {
    const response = await fetch(baseUrl + '/api/docs-json');
    assert.equal(response.status, 200);
    const body = (await response.json()) as { paths: Record<string, unknown> };
    assert.ok(body.paths['/api/v1/health']);
    const ui = await fetch(baseUrl + '/api/docs');
    assert.equal(ui.status, 200);
    assert.match(await ui.text(), /swagger-ui/);
  });

  it('permits the configured web origin but not arbitrary origins', async () => {
    const allowed = await fetch(baseUrl + '/api/v1/health', {
      headers: { Origin: 'http://localhost:8081' },
    });
    assert.equal(
      allowed.headers.get('access-control-allow-origin'),
      'http://localhost:8081',
    );
    await allowed.text();
    const denied = await fetch(baseUrl + '/api/v1/health', {
      headers: { Origin: 'https://untrusted.example' },
    });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    await denied.text();
  });

  it('rejects invalid DTOs and extra fields without echoing sensitive values', async () => {
    const response = await fetch(baseUrl + '/api/v1/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', unexpected: 'private-input' }),
    });
    assert.equal(response.status, 400);
    const text = await response.text();
    const body = JSON.parse(text) as {
      code: string;
      details: { fields: { field: string }[] };
    };
    assert.equal(body.code, 'VALIDATION_ERROR');
    assert.deepEqual(body.details.fields.map((field) => field.field).sort(), [
      'name',
      'unexpected',
    ]);
    assert.ok(!text.includes('private-input'));
  });

  it('accepts valid DTOs', async () => {
    const response = await fetch(baseUrl + '/api/v1/probe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'foundation' }),
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { name: 'foundation' });
  });

  it('sanitizes unexpected exceptions', async () => {
    const response = await fetch(baseUrl + '/api/v1/probe/failure');
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: {},
    });
  });
});

it('does not expose Swagger in production', async () => {
  const app = await startApp('production');
  try {
    for (const path of ['/api/docs', '/api/docs-json']) {
      const response = await fetch((await app.getUrl()) + path);
      assert.equal(response.status, 404);
      await response.text();
    }
  } finally {
    await app.close();
  }
});

it('rejects invalid configuration without exposing credential values', () => {
  assert.throws(
    () =>
      validateEnvironment({
        DATABASE_URL: 'sensitive-invalid-value',
        API_PORT: 'invalid',
        CORS_ORIGINS: '*',
      }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /DATABASE_URL/);
      assert.match(error.message, /API_PORT/);
      assert.match(error.message, /CORS_ORIGINS/);
      assert.ok(!error.message.includes('sensitive-invalid-value'));
      return true;
    },
  );
});
