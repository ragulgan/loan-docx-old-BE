import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateCustomerLoanDetailsDto } from './dto/create-csloan.dto';
import { AdminApproveDto } from './dto/admin-approve.dto';
import { Transaction } from '../transaction/transaction.entity';
import { CustomerLoanDetails } from './entities/customer_loan.entity';
import { DaywiseAgentBalance } from 'src/agent-daywise-balance/entities/agent_balance.entity';
import { LoanProcessingFees } from 'src/processing_fees/processing.entity';

@Injectable()
export class CustomerLoanDetailService {
  constructor(
    @InjectRepository(CustomerLoanDetails) private customerLoanDetailRepo: Repository<CustomerLoanDetails>,
    @InjectRepository(Transaction) private transactionRepo: Repository<Transaction>,
    @InjectRepository(DaywiseAgentBalance) private agentBalanceRepo: Repository<DaywiseAgentBalance>,
    @InjectRepository(LoanProcessingFees) private loanFeesRepo: Repository<LoanProcessingFees>,
    private readonly dataSource: DataSource,
  ) { }

  async create(dto: CreateCustomerLoanDetailsDto) {
    return await this.customerLoanDetailRepo.manager.transaction(
      async (manager) => {
        const customerLoan = manager.create(CustomerLoanDetails, {
          ...dto,
        });
        const savedCustomerLoan = await manager.save(customerLoan);
        const transaction = manager.create(Transaction, {
          loan_name: dto.loan_name,
          customer_id: savedCustomerLoan.customer_id,
          agent_id: dto.agent_id,
          trans_creation_date: dto.creation_date,
          transaction_state: 'P',
        });
        const savedTransaction = await manager.save(transaction);
        savedCustomerLoan.transaction_id = savedTransaction.transaction_id;
        await manager.save(savedCustomerLoan);
        return savedCustomerLoan;
      },
    );
  }

  // using repository query builder
  async findAll(params: any) {
    const { limit = 10, skip = 0 } = params || {};
    const loanApp_pending = this.customerLoanDetailRepo
      .createQueryBuilder('c')
      .innerJoin(
        Transaction,
        't',
        `
          t.customer_id = c.customer_id
          AND t.transaction_id = c.transaction_id
          AND t.transaction_state = :state
          `,
        { state: 'P' },
      )
      .select([
        'c.loan_name AS loan_name',
        'c.customer_id AS customer_id',
        'c.agent_id AS agent_id',
        'c.loan_amount AS loan_amount',
        'c.processing_fees AS processing_fees',
        't.transaction_id AS transaction_id',
        'c.amount_recived AS amount_recived',
        'c.customer_name AS customer_name',
        'c.mobile_number AS mobile_number',
      ])
      .orderBy('c.customer_id', 'ASC')
      .skip(skip)
      .take(limit);
    const data = await loanApp_pending.getRawMany();
    const count = await loanApp_pending.getCount();
    return {
      loanCompanyList: data,
      count,
    };
  }

  async adminApprove(dto: AdminApproveDto) {
    return this.dataSource.transaction(async (manager) => {
      const {
        transactionId,
        adminUserId,
        legalUserId,
        civilUserId,
        legalHeadId,
        agentId,
        loanAmount,
      } = dto;

      const transaction = await manager.findOne(Transaction, {
        where: { transaction_id: transactionId },
      });

      if (!transaction) {
        throw new BadRequestException('Transaction not found');
      }

      transaction.transaction_state = 'A';
      transaction.trans_state_modified_by = adminUserId;
      transaction.trans_state_modified_on = new Date().toISOString().slice(0, 10);
      transaction.legal_team_user = legalUserId;
      transaction.legal_team_job_allocation_date = new Date().toISOString().slice(0, 10);
      transaction.civil_team_user = civilUserId;
      transaction.civil_team_job_allocation_date = new Date().toISOString().slice(0, 10);
      transaction.legal_head_user = legalHeadId;

      await manager.save(transaction);

      if (loanAmount <= 0) {
        throw new BadRequestException('Invalid loan amount');
      }
      const feeRow = await manager
        .createQueryBuilder()
        .select('f.AT_fees', 'AT_fees')
        .from('LoandocX_loan_processing_fees', 'f')
        .where('f.from_loan_amount < :amt', { amt: loanAmount })
        .andWhere('f.to_loan_amount >= :amt', { amt: loanAmount })
        .limit(1)
        .getRawOne();

      const atFees = feeRow?.AT_fees ?? 0;

      const today = new Date().toISOString().slice(0, 10);

      let agentBalance = await manager.findOne(DaywiseAgentBalance, {
        where: {
          agent_id: agentId,
          trans_aproved_date: today,
        },
      });

      if (agentBalance) {
        // UPDATE
        agentBalance.account_balance += atFees;
      } else {
        // INSERT
        agentBalance = manager.create(DaywiseAgentBalance, {
          agent_id: agentId,
          trans_aproved_date: today,
          account_balance: atFees,
          payment_done: 'N',
        });
      }

      await manager.save(agentBalance);

      return {
        success: true,
        transactionId: transaction.transaction_id
      };
    });
  }

  async trackLoan(query: string, type: 'txn' | 'mobile') {
    let transactionId: string | null = null;
    if (type === 'mobile') {
      const customer = await this.dataSource.query(
        `
      SELECT transaction_id
      FROM LoandocX_Customers_loan_details
      WHERE mobile_number = ?
      `,
        [query],
      );

      if (!customer || customer.length === 0) {
        return "Invalid mobile number";
      }

      transactionId = customer[0].transaction_id;
    }

    if (type === 'txn') {
      transactionId = query;
    }

    const transaction = await this.dataSource.query(
      `
    SELECT 
      t.transaction_id,
      t.transaction_state,
      t.legal_team_job_completion_date,
      t.civil_team_job_completion_date,
      t.legal_head_job_completion_date,
      c.customer_name,
      c.loan_name,
      t.trans_creation_date
    FROM LoandocX_Transactions t
    LEFT JOIN LoandocX_Customers_loan_details c
      ON t.transaction_id = c.transaction_id
    WHERE t.transaction_id = ?
    `,
      [transactionId],
    );

    if (!transaction || transaction.length === 0) {
      return "Invalid transaction id";
    }
    return { success: true, data: transaction[0] };
  }

  async getBalance(userId: string, userType: string) {
    let query = '';
    let params = [userId];

    switch (userType) {
      case 'AT':
        query = `
          SELECT COALESCE(SUM(account_balance), 0) AS balance
          FROM LoandocX_Daywise_Agent_balance
          WHERE agent_id = ? AND payment_done = 'N'
        `;
        break;

      case 'LU':
        query = `
          SELECT COALESCE(SUM(account_balance), 0) AS balance
          FROM LoandocX_Daywise_Legal_user_balance
          WHERE legal_user_id = ? AND payment_done = 'N'
        `;
        break;

      case 'LH':
        query = `
          SELECT COALESCE(SUM(account_balance), 0) AS balance
          FROM LoandocX_Daywise_Legal_head_balance
          WHERE legal_head_id = ? AND payment_done = 'N'
        `;
        break;

      case 'CU':
        query = `
          SELECT COALESCE(SUM(account_balance), 0) AS balance
          FROM LoandocX_Daywise_Civil_user_balance
          WHERE civil_user_id = ? AND payment_done = 'N'
        `;
        break;

      default:
        throw new BadRequestException('Invalid user type for earnings calculation');
    }

    const result = await this.dataSource.query(query, params);
    const balance = Number(result[0]?.balance || 0);
    return {
      data: {
        balance,
      },
    };
  }
}