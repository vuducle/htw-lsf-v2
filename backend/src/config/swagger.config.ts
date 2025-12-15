import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Setup Swagger documentation
 * @param app {INestApplication}
 */
export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('My Awesome TypeScript Backend')
    .setDescription('API documentation for My Awesome TypeScript Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
