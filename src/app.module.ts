import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DbErrorMapperService } from './common/db-error-mapper.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: false,
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsTableName: '_migrations',
        migrationsRun: true,
        subscribers: [],
      }),
    }),
    WalletsModule,
    TransactionsModule,
  ],
  controllers: [],
  providers: [DbErrorMapperService],
})
export class AppModule {}
