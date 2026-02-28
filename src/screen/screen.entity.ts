import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from '../role/role.entity';

@Entity('loandocx_screens')
export class Screen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  screen_name: string;

  @Column({ type: 'varchar', length: 200 })
  screen_url: string;

  @Column({ type: 'char', length: 1 })
  screen_active: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn( { type: 'timestamp' })
  updated_at: Date;

  // Many-to-Many with Role
  @ManyToMany(() => Role, (role) => role.screens, { cascade: true })
  @JoinTable({
    name: 'loandocx_role_screen_mapping', // Junction table name
    joinColumn: {
      name: 'screen_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}