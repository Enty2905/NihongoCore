import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './common/configure-app';
import type { Environment } from './common/environment';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  try {
    configureApp(app);
    app.enableShutdownHooks();
    const config = app.get(ConfigService<Environment, true>);
    await app.listen(
      config.get('API_PORT', { infer: true }),
      config.get('API_HOST', { infer: true }),
    );
    Logger.log('API listening on port ' + config.get('API_PORT'), 'Bootstrap');
  } catch (error) {
    await app.close();
    throw error;
  }
}

void bootstrap().catch(() => {
  Logger.error(
    'API startup failed. Check environment configuration and PostgreSQL availability.',
    'Bootstrap',
  );
  process.exitCode = 1;
});
