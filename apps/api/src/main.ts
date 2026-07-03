import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // Allow the web app (and other clients) to call the API during development.
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Bornite API')
    .setDescription('Risk-based vulnerability management API')
    .setVersion('0.0.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  console.log(`Bornite API listening on http://localhost:${port} (OpenAPI docs at /docs)`);
}

void bootstrap();
