import { Controller, Get, Redirect } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('swagger')
  @Redirect('/docs', 301)
  redirectToSwagger(): void {
    // Redirects to Swagger documentation
  }

  @Get('api-docs')
  @Redirect('/docs', 301)
  redirectToApiDocs(): void {
    // Redirects to Swagger documentation
  }
}
