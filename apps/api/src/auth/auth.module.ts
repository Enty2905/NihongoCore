import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import type { Environment } from '../common/environment';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessAuthGuard } from './guards/access-auth.guard';
import { ClockService } from './services/clock.service';
import { PasswordService } from './services/password.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { AuthTransportService } from './transport/auth-transport.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    JwtModule.register({}),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => [
        {
          ttl: config.get('AUTH_THROTTLE_TTL_MS', { infer: true }),
          limit: config.get('AUTH_THROTTLE_LIMIT', { infer: true }),
        },
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessAuthGuard,
    AuthTransportService,
    ClockService,
    PasswordService,
    SessionService,
    TokenService,
  ],
  exports: [AccessAuthGuard, AuthService],
})
export class AuthModule {}
