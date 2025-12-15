import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config();

const configService = new ConfigService();

const isCompiled = __filename.endsWith('.js');

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.get('DATABASE_URL'),
  entities: isCompiled
    ? [__dirname + '/**/*.entity.js']
    : [__dirname + '/src/**/*.entity.ts'],
  migrations: isCompiled
    ? [__dirname + '/migrations/*.js']
    : [__dirname + '/migrations/*.ts'],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
