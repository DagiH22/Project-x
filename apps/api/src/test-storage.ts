import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StorageService } from './modules/storage/storage.service';

async function bootstrap() {
  console.log('Initializing test...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const storageService = app.get(StorageService);

  const testKey = 'test-file.txt';
  const testBody = Buffer.from('Hello AgentDesk Storage!');

  try {
    console.log('Testing upload...');
    await storageService.upload({
      key: testKey,
      body: testBody,
      contentType: 'text/plain',
    });
    console.log('Upload successful!');

    console.log('Testing delete...');
    await storageService.delete(testKey);
    console.log('Delete successful!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
