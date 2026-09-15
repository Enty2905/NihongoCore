import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { after, before, describe, it } from 'node:test';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { configureApp } from '../src/common/configure-app';
import { PrismaService } from '../src/database/prisma.service';
import { TokenService } from '../src/auth/services/token.service';

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
process.env.AUTH_THROTTLE_LIMIT = '1000';

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string | null };
}

interface ErrorResult {
  statusCode: number;
  code: string;
  message: string;
  details: unknown;
}

describe('Authentication', () => {
  let app: INestApplication;
  let baseUrl: string;
  let prisma: PrismaService;

  before(async () => {
    const { AppModule } = await import('../src/app.module');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    configureApp(app);
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
    prisma = app.get(PrismaService);
    await cleanup();
  });

  after(async () => {
    await cleanup();
    await app?.close();
  });

  async function cleanup() {
    if (!prisma) return;
    await prisma.user.deleteMany({
      where: { email: { endsWith: '@auth.test' } },
    });
  }

  function email(label: string): string {
    return label + '-' + crypto.randomUUID() + '@auth.test';
  }

  async function nativePost(
    path: string,
    body: Record<string, unknown>,
  ): Promise<Response> {
    return fetch(baseUrl + '/api/v1/auth/' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Platform': 'native',
      },
      body: JSON.stringify(body),
    });
  }

  async function register(
    address = email('register'),
    password = 'mật khẩu đủ mười lăm ký tự',
  ): Promise<AuthResult> {
    const response = await nativePost('register', {
      email: '  ' + address.toUpperCase() + '  ',
      password,
      displayName: '  Minh  ',
    });
    assert.equal(response.status, 201, await response.clone().text());
    return response.json() as Promise<AuthResult>;
  }

  it('registers, normalizes fields, hashes secrets and auto-authenticates', async () => {
    const address = email('normalized');
    const password = 'exact password value  ';
    const result = await register(address, password);
    assert.equal(result.user.email, address);
    assert.equal(result.user.displayName, 'Minh');
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);

    const stored = await prisma.user.findUnique({
      where: { email: address },
      include: { sessions: { include: { refreshTokens: true } } },
    });
    assert.ok(stored);
    assert.notEqual(stored.passwordHash, password);
    assert.ok(stored.passwordHash.startsWith('$argon2id$'));
    assert.equal(stored.sessions.length, 1);
    assert.equal(stored.sessions[0].refreshTokens.length, 1);
    assert.notEqual(
      stored.sessions[0].refreshTokens[0].tokenHash,
      result.refreshToken,
    );
    const serialized = JSON.stringify(result);
    assert.ok(!serialized.includes(stored.passwordHash));
    assert.ok(
      !serialized.includes(stored.sessions[0].refreshTokens[0].tokenHash),
    );
  });

  it('validates input and rejects a duplicate normalized email', async () => {
    const address = email('duplicate');
    await register(address);
    const duplicate = await nativePost('register', {
      email: '  ' + address.toUpperCase() + ' ',
      password: 'another valid password',
    });
    assert.equal(duplicate.status, 409);
    assert.equal(
      ((await duplicate.json()) as ErrorResult).code,
      'EMAIL_ALREADY_EXISTS',
    );

    const invalid = await nativePost('register', {
      email: 'not-email',
      password: 'too short',
      displayName: 'x'.repeat(81),
    });
    assert.equal(invalid.status, 400);
    assert.equal(
      ((await invalid.json()) as ErrorResult).code,
      'VALIDATION_ERROR',
    );
  });

  it('allows only one concurrent registration for a normalized email', async () => {
    const address = email('race-register');
    const responses = await Promise.all([
      nativePost('register', {
        email: address,
        password: 'a sufficiently long password',
      }),
      nativePost('register', {
        email: address.toUpperCase(),
        password: 'a sufficiently long password',
      }),
    ]);
    assert.deepEqual(
      responses.map((response) => response.status).sort(),
      [201, 409],
    );
  });

  it('keeps nonexistent and wrong-password Login publicly identical', async () => {
    const address = email('login');
    await register(address, 'correct password value');
    const wrong = await nativePost('login', {
      email: address,
      password: 'wrong password value',
    });
    const missing = await nativePost('login', {
      email: email('missing'),
      password: 'wrong password value',
    });
    assert.equal(wrong.status, 401);
    assert.equal(missing.status, 401);
    assert.deepEqual(await wrong.json(), await missing.json());
  });

  it('bounds Login password input at 128 Unicode code points', async () => {
    const response = await nativePost('login', {
      email: email('bounded-login'),
      password: '🙂'.repeat(129),
    });
    assert.equal(response.status, 400);
    assert.equal(
      ((await response.json()) as ErrorResult).code,
      'VALIDATION_ERROR',
    );
  });

  it('creates independent Login sessions', async () => {
    const address = email('sessions');
    await register(address, 'correct password value');
    const first = await nativePost('login', {
      email: address,
      password: 'correct password value',
    });
    const second = await nativePost('login', {
      email: address,
      password: 'correct password value',
    });
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    const sessions = await prisma.authSession.count({
      where: { user: { email: address } },
    });
    assert.equal(sessions, 3);
  });

  it('rotates once and revokes the family when the old token is reused', async () => {
    const initial = await register();
    const rotated = await nativePost('refresh', {
      refreshToken: initial.refreshToken,
    });
    assert.equal(rotated.status, 200);
    const successor = (await rotated.json()) as AuthResult;

    const replay = await nativePost('refresh', {
      refreshToken: initial.refreshToken,
    });
    assert.equal(replay.status, 401);
    assert.equal(
      ((await replay.json()) as ErrorResult).code,
      'REFRESH_TOKEN_REUSED',
    );

    const afterReplay = await nativePost('refresh', {
      refreshToken: successor.refreshToken,
    });
    assert.equal(afterReplay.status, 401);
  });

  it('rejects unknown and expired refresh credentials', async () => {
    const unknown = await nativePost('refresh', {
      refreshToken: 'x'.repeat(43),
    });
    assert.equal(unknown.status, 401);
    assert.equal(
      ((await unknown.json()) as ErrorResult).code,
      'INVALID_REFRESH_TOKEN',
    );

    const issued = await register();
    const tokens = app.get(TokenService);
    await prisma.refreshToken.update({
      where: { tokenHash: tokens.hashRefreshToken(issued.refreshToken) },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    const expired = await nativePost('refresh', {
      refreshToken: issued.refreshToken,
    });
    assert.equal(expired.status, 401);
    assert.equal(
      ((await expired.json()) as ErrorResult).code,
      'INVALID_REFRESH_TOKEN',
    );
  });

  it('enforces refresh inactivity and absolute session expiry', async () => {
    const tokens = app.get(TokenService);
    const inactive = await register();
    const inactiveToken = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: tokens.hashRefreshToken(inactive.refreshToken) },
    });
    await prisma.authSession.update({
      where: { id: inactiveToken.sessionId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    assert.equal(
      (await nativePost('refresh', { refreshToken: inactive.refreshToken }))
        .status,
      401,
    );

    const absolute = await register();
    const absoluteToken = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: tokens.hashRefreshToken(absolute.refreshToken) },
    });
    await prisma.authSession.update({
      where: { id: absoluteToken.sessionId },
      data: { absoluteExpiresAt: new Date(Date.now() - 1000) },
    });
    assert.equal(
      (await nativePost('refresh', { refreshToken: absolute.refreshToken }))
        .status,
      401,
    );
  });

  it('handles a concurrent refresh race without two usable branches', async () => {
    const initial = await register();
    const [first, second] = await Promise.all([
      nativePost('refresh', { refreshToken: initial.refreshToken }),
      nativePost('refresh', { refreshToken: initial.refreshToken }),
    ]);
    assert.deepEqual([first.status, second.status].sort(), [200, 401]);
    const success = first.status === 200 ? first : second;
    const next = (await success.json()) as AuthResult;
    const familyCheck = await nativePost('refresh', {
      refreshToken: next.refreshToken,
    });
    assert.equal(familyCheck.status, 401);
  });

  it('protects /me and ignores client-selected userId', async () => {
    const issued = await register();
    const missing = await fetch(baseUrl + '/api/v1/auth/me');
    assert.equal(missing.status, 401);

    const me = await fetch(
      baseUrl + '/api/v1/auth/me?userId=' + crypto.randomUUID(),
      { headers: { Authorization: 'Bearer ' + issued.accessToken } },
    );
    assert.equal(me.status, 200);
    assert.deepEqual(await me.json(), issued.user);

    const forged = await fetch(baseUrl + '/api/v1/auth/me', {
      headers: { Authorization: 'Bearer forged.token.value' },
    });
    assert.equal(forged.status, 401);

    const tokens = app.get(TokenService);
    const session = await prisma.refreshToken.findUniqueOrThrow({
      where: { tokenHash: tokens.hashRefreshToken(issued.refreshToken) },
    });
    const expiredAccess = await app.get(JwtService).signAsync(
      { sub: issued.user.id, sid: session.sessionId, typ: 'access' },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        issuer: 'nihongocore-api',
        audience: 'nihongocore-client',
        expiresIn: -1,
      },
    );
    assert.equal(
      (
        await fetch(baseUrl + '/api/v1/auth/me', {
          headers: { Authorization: 'Bearer ' + expiredAccess },
        })
      ).status,
      401,
    );
  });

  it('fails closed with a safe service error when auth lookup is unavailable', async () => {
    const issued = await register();
    const delegate = prisma.authSession as object;
    const originalFindFirst = Reflect.get(delegate, 'findFirst');
    Reflect.set(delegate, 'findFirst', () =>
      Promise.reject(new Error('sensitive database failure')),
    );
    try {
      const response = await fetch(baseUrl + '/api/v1/auth/me', {
        headers: { Authorization: 'Bearer ' + issued.accessToken },
      });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        statusCode: 503,
        code: 'AUTH_SERVICE_UNAVAILABLE',
        message: 'Authentication is temporarily unavailable.',
        details: {},
      });
    } finally {
      Reflect.set(delegate, 'findFirst', originalFindFirst);
    }
  });

  it('logs out only the current session and blocks its access/refresh', async () => {
    const address = email('logout');
    const first = await register(address, 'correct password value');
    const secondResponse = await nativePost('login', {
      email: address,
      password: 'correct password value',
    });
    const second = (await secondResponse.json()) as AuthResult;

    const logout = await nativePost('logout', {
      refreshToken: first.refreshToken,
    });
    assert.equal(logout.status, 204);
    assert.equal(
      (await nativePost('refresh', { refreshToken: first.refreshToken }))
        .status,
      401,
    );
    assert.equal(
      (
        await fetch(baseUrl + '/api/v1/auth/me', {
          headers: { Authorization: 'Bearer ' + first.accessToken },
        })
      ).status,
      401,
    );
    assert.equal(
      (await nativePost('refresh', { refreshToken: second.refreshToken }))
        .status,
      200,
    );
    assert.equal(
      (await nativePost('logout', { refreshToken: 'z'.repeat(43) })).status,
      204,
    );
  });

  it('sets safe Web cookies and enforces Origin, CSRF and transport separation', async () => {
    const body = JSON.stringify({
      email: email('web'),
      password: 'a sufficiently long password',
    });
    const valid = await fetch(baseUrl + '/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:8081',
        'X-Client-Platform': 'web',
        'X-CSRF-Protection': '1',
      },
      body,
    });
    assert.equal(valid.status, 201);
    const cookie = valid.headers.get('set-cookie') ?? '';
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Path=\/api\/v1\/auth/i);
    assert.ok(!(await valid.text()).includes('refreshToken'));

    const missingCsrf = await fetch(baseUrl + '/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:8081',
        'X-Client-Platform': 'web',
      },
      body,
    });
    assert.equal(missingCsrf.status, 400);

    const nativeFromBrowser = await fetch(baseUrl + '/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:8081',
        'X-Client-Platform': 'native',
      },
      body: JSON.stringify({
        email: email('none'),
        password: 'a sufficiently long password',
      }),
    });
    assert.equal(nativeFromBrowser.status, 400);
  });
});
