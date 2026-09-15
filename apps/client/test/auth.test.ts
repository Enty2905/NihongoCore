import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  codePointLength,
  loginSchema,
  registerSchema,
} from '../src/features/auth/schemas';

describe('Authentication client validation', () => {
  it('counts Unicode code points rather than UTF-16 code units', () => {
    assert.equal(codePointLength('日本語🙂'), 4);
    assert.equal(codePointLength('🙂'.repeat(15)), 15);
  });

  it('normalizes email while preserving dots and plus aliases', () => {
    const result = loginSchema.parse({
      email: '  Learner.Name+Deck@Example.COM  ',
      password: 'a valid password value',
    });
    assert.equal(result.email, 'learner.name+deck@example.com');
  });

  it('accepts exact 15–128 code-point passwords without composition rules', () => {
    assert.equal(
      registerSchema.safeParse({
        email: 'learner@example.com',
        password: ' '.repeat(15),
      }).success,
      true,
    );
    assert.equal(
      registerSchema.safeParse({
        email: 'learner@example.com',
        password: '🙂'.repeat(14),
      }).success,
      false,
    );
    assert.equal(
      registerSchema.safeParse({
        email: 'learner@example.com',
        password: '🙂'.repeat(129),
      }).success,
      false,
    );
  });

  it('treats blank display name as absent and caps it at 80 code points', () => {
    const blank = registerSchema.parse({
      email: 'learner@example.com',
      password: 'a valid password value',
      displayName: '   ',
    });
    assert.equal(blank.displayName, undefined);
    assert.equal(
      registerSchema.safeParse({
        email: 'learner@example.com',
        password: 'a valid password value',
        displayName: '界'.repeat(81),
      }).success,
      false,
    );
  });

  it('does not trim or truncate password input', () => {
    const password = '  exact password value  ';
    const result = registerSchema.parse({
      email: 'learner@example.com',
      password,
    });
    assert.equal(result.password, password);
  });

  it('bounds Login password input without imposing registration composition rules', () => {
    assert.equal(
      loginSchema.safeParse({
        email: 'learner@example.com',
        password: '🙂'.repeat(128),
      }).success,
      true,
    );
    assert.equal(
      loginSchema.safeParse({
        email: 'learner@example.com',
        password: '🙂'.repeat(129),
      }).success,
      false,
    );
  });
});
