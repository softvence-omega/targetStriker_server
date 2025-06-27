import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UtilsModule } from './utils/utils.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeedModule } from './seed/seed.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { MainModule } from './main/main.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QueuesModule } from './queues/queues.module';
import { BullModule } from '@nestjs/bullmq';
@Module({
  imports: [
    UtilsModule,
    CacheModule.register({
      isGlobal: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), // Folder with static files
      serveRoot: '/ts/files', // Files will be served at /files/<filename>
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SeedModule,

    PassportModule,
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
      global: true,
    }),

    MainModule,

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new CacheableMemory(),
          }),
          createKeyv(configService.getOrThrow<string>('REDIS_URL')),
        ],
      }),
      isGlobal: true,
    }),

    EventEmitterModule.forRoot({}),

    QueuesModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService], // <- this line is required
      useFactory: async (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('REDIS_HOST');
        const port = configService.getOrThrow<string>('REDIS_PORT');
        
        return {
          connection: {
            host,
            port:parseInt(port, 10),
          },
        };
      },
    }),
  ],
  controllers: [AppController],

  providers: [AppService, JwtStrategy],

  exports: [JwtStrategy],
  
})
export class AppModule {}
