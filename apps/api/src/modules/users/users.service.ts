import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { users, NewUser, User } from '@agentdesk/db';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(user: NewUser): Promise<User> {
    const [createdUser] = await this.databaseService.db
      .insert(users)
      .values(user)
      .returning();
    return createdUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }
}
