"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const storage_service_1 = require("./src/modules/storage/storage.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const storageService = app.get(storage_service_1.StorageService);
    console.log('Testing StorageService...');
    const testKey = 'test-folder/test-file.txt';
    const testContent = 'Hello from AgentDesk Storage Module!';
    try {
        console.log(`Uploading object to key: ${testKey}`);
        await storageService.upload({
            key: testKey,
            body: testContent,
            contentType: 'text/plain',
        });
        console.log('Upload successful.');
        console.log(`Downloading object from key: ${testKey}`);
        const downloaded = await storageService.get(testKey);
        console.log('Download response stream ready.');
        console.log(`Deleting object with key: ${testKey}`);
        await storageService.delete(testKey);
        console.log('Delete successful.');
        console.log('Storage verification completed successfully!');
    }
    catch (error) {
        console.error('Storage verification failed:', error);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=test-storage.js.map