import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Loantype } from '../loanType/loantype.entity';

@Entity('loandocx_company_details')
export class LoanCompanyDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  company_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  bank_name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  branch_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  upi_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  company_mail_id: string;
}