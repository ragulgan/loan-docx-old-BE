import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Loantype } from '../loanType/loantype.entity';

@Entity('loandocx_loan_doc_checklist')
export class LoanDocCheckList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  doc_name: string;

  @Column({ type: 'varchar', length: 100 })
  doc_description: string;

  @Column({ type: 'char', length: 1, nullable: false })
  doc_required_for_legal: string;

  @Column({ type: 'char', length: 1, nullable: false })
  doc_required_for_civil: string;

  @Column({ type: 'int', name: 'loan_id' })
  loan_id: number;

  @ManyToOne(() => Loantype, (loantype) => loantype.docs, { nullable: false })
  @JoinColumn({ name: 'loan_id', referencedColumnName: 'id' })
  loan: Loantype;
}