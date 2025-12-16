import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DbErrorMapperService } from '../../common/db-error-mapper.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService, DbErrorMapperService],
})
export class TransactionsModule {}
