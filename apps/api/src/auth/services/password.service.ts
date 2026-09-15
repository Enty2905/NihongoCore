import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import argon2 from 'argon2';
import type { Environment } from '../../common/environment';

@Injectable()
export class PasswordService implements OnModuleInit {
  private dummyHash = '';

  constructor(private readonly config: ConfigService<Environment, true>) {}

  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.hash('dummy-password-value-for-timing');
  }

  hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: this.config.get('AUTH_ARGON2_MEMORY_KIB', { infer: true }),
      timeCost: this.config.get('AUTH_ARGON2_TIME_COST', { infer: true }),
      parallelism: this.config.get('AUTH_ARGON2_PARALLELISM', { infer: true }),
    });
  }

  verify(passwordHash: string | null, password: string): Promise<boolean> {
    return argon2.verify(passwordHash ?? this.dummyHash, password);
  }
}
