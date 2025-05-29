import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class DbService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Utility function to exclude specific properties from Prisma results
   * @param obj - The object to exclude properties from
   * @param keys - Array of keys to exclude
   * @returns Object without the excluded properties
   */
  exclude<T, Key extends keyof T>(
    obj: T,
    keys: Key[]
  ): Omit<T, Key> {
    if (!obj) return obj as Omit<T, Key>;
    
    const filteredEntries = Object.entries(obj as any).filter(
      ([key]) => !keys.includes(key as Key)
    );
    return Object.fromEntries(filteredEntries) as Omit<T, Key>;
  }

  /**
   * Utility function to exclude properties from an array of objects
   * @param array - Array of objects to exclude properties from
   * @param keys - Array of keys to exclude
   * @returns Array of objects without the excluded properties
   */
  excludeFromArray<T, Key extends keyof T>(
    array: T[],
    keys: Key[]
  ): Omit<T, Key>[] {
    if (!array) return [];
    return array.map(obj => this.exclude(obj, keys));
  }

  /**
   * Exclude sensitive user fields (password, refreshToken, etc.)
   * @param user - User object
   * @returns User object without sensitive fields
   */
  excludeSensitiveUserFields<T extends { password?: any; refreshToken?: any }>(
    user: T
  ): Omit<T, 'password' | 'refreshToken'> {
    return this.exclude(user, ['password', 'refreshToken']);
  }

  /**
   * Common select objects for excluding sensitive fields
   */
  readonly selects = {
    user: {
      withoutPassword: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        password: false,
        refreshToken: false,
      },
      public: {
        id: true,
        name: true,
        email: true,
      }
    },
    // Add more model selects as needed
  } as const;

  /**
   * Helper method to find user without sensitive fields
   */
  async findUserSafe(where: any) {
    const user = await this.user.findFirst({ where });
    return user ? this.excludeSensitiveUserFields(user) : null;
  }

}