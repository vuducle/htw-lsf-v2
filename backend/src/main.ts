import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { Logger } from '@nestjs/common';
/**
 * Bootstrap function to start the NestJS application.
 * This function creates the application instance, sets up Swagger documentation,
 * and starts listening on the specified port.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
