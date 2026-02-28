import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { User } from '../users/users.entity';
import { Screen } from '../screen/screen.entity';

@Entity('loandocx_role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 2 })
  role_code: string;

  @Column({ type: 'varchar', length: 50 })
  role_name: string;

  @Column({ type: 'char', length: 1 })
  role_active: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @ManyToMany(() => Screen, (screen) => screen.roles)
  screens: Screen[];
}
