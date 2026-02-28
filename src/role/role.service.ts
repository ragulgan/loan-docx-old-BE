import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, Not } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
  ) { }

  async create(dto: CreateRoleDto) {
    const user = this.roleRepo.create(dto);
    return await this.roleRepo.save(user);
  }

  async findAll(params: { limit?: number; skip?: number; status?: string }) {
    const { limit = 10, skip = 0, status } = params || {};

    const where: FindOptionsWhere<Role> = {};

    if (status) {
      where.role_active = status;
    }

    const [userList, count] = await this.roleRepo.findAndCount({
      where,
      take: limit,
      skip,
      order: { id: 'DESC' },
    });

    return { userList, count };
  }

  async findOne(id: number) {
    const user = await this.roleRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateRoleDto) {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return await this.roleRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return await this.roleRepo.remove(user);
  }
}
