import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorHandlerFilter } from './error/globlaErrorHandler.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Baxton API')
    .setDescription('The Baxton cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  app.useGlobalFilters(new GlobalErrorHandlerFilter());
  app.setGlobalPrefix('ts');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
