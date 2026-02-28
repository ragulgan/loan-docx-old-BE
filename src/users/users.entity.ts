import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Role } from '../role/role.entity';
import * as bcrypt from 'bcrypt';

@Entity('loandocx_users_profile')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 10 })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  user_name: string;

  @Column({ type: 'int', name: 'user_type' })
  user_type: number;

  @ManyToOne(() => Role, (role) => role.users, { nullable: false })
  @JoinColumn({ name: 'user_type', referencedColumnName: 'id' })
  role: Role;

  @Column({ type: 'varchar', length: 255, select: false })
  user_pwd: string;

  @Column({ type: 'varchar', length: 100 })
  upi_id: string;

  @Column({ type: 'varchar', length: 200 })
  address1: string;

  @Column({ type: 'varchar', length: 200 })
  address2: string;

  @Column({ unique: true, type: 'bigint' })
  mobile_number: string;

  @Column({type: 'varchar', length: 100})
  email_id: string;

  @Column({ unique: true, type: 'varchar', length: 50 })
  aadhar_number: string;

  @Column({ type: 'char', length: 1 })
  user_active: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.user_pwd) {
      const salt = await bcrypt.genSalt(10);
      this.user_pwd = await bcrypt.hash(this.user_pwd, salt);
    }
  }
}
