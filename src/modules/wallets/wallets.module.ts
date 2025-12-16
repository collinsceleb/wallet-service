import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { DbErrorMapperService } from '../../common/db-error-mapper.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletsController } from './wallets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletsController],
  providers: [WalletsService, DbErrorMapperService],
})
export class WalletsModule {}
