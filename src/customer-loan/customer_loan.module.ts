import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerLoanDetailService } from './customer_loan.service';
import { CustomerLoanDetailController } from './customer_loan.controller';
import { Transaction } from '../transaction/transaction.entity';
import { ResponseService } from '../base/controller';
import { CustomerLoanDetails } from './entities/customer_loan.entity';
import { DaywiseAgentBalance } from 'src/agent-daywise-balance/entities/agent_balance.entity';
import { LoanProcessingFees } from 'src/processing_fees/processing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerLoanDetails, Transaction, DaywiseAgentBalance, LoanProcessingFees])],
  controllers: [CustomerLoanDetailController],
  providers: [CustomerLoanDetailService, ResponseService],
  exports: [CustomerLoanDetailService],
})
export class CustomerLoanDetailsModule {}