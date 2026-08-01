import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@agentdesk/db';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public readonly db: NodePgDatabase<typeof schema>;
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('DB_URL');
    if (!connectionString) {
      throw new Error('DB_URL is not defined in the environment variables');
    }

    this.pool = new Pool({
      connectionString,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try {
      await this.pool.connect();
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.logger.error('Failed to connect to the database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing database connection pool.');
    await this.pool.end();
  }
}
