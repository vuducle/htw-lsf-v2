import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Setup Swagger documentation
 * @param app {INestApplication}
 */
export function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('LSF HTW Berlin - Version 2.0, but cooler')
    .setDescription('API documentation for LSF HTW Berlin Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
}
