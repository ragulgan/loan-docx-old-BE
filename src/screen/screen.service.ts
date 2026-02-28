import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Screen } from './screen.entity';
import { Role } from '../role/role.entity';
import { CreateScreenDto } from './dto/create-screen.dto';
import { UpdateScreenDto } from './dto/update-screen.dto';

@Injectable()
export class ScreenService {
  constructor(
    @InjectRepository(Screen) 
    private screenRepo: Repository<Screen>,
    
    @InjectRepository(Role) 
    private roleRepo: Repository<Role>,
  ) {}

  async create(dto: CreateScreenDto) {
    const { role_ids, ...screenData } = dto;

    // Find roles by IDs
    const roles = await this.roleRepo.findBy({
      id: In(role_ids),
    });

    // Validate all roles exist
    if (roles.length !== role_ids.length) {
      const foundIds = roles.map(r => r.id);
      const missingIds = role_ids.filter(id => !foundIds.includes(id));
      throw new BadRequestException(
        `Role IDs not found: ${missingIds.join(', ')}`
      );
    }

    // Create screen with roles
    const screen = this.screenRepo.create({
      ...screenData,
      roles,
    });

    // Save with cascade
    const savedScreen = await this.screenRepo.save(screen);

    // Return with relations
    return await this.screenRepo.findOne({
      where: { id: savedScreen.id },
      relations: ['roles'],
    });
  }

  async findAll(params: { limit?: number; skip?: number; status?: string }) {
    const { limit = 10, skip = 0, status } = params || {};

    const where: FindOptionsWhere<Screen> = {};

    if (status) {
      where.screen_active = status;
    }

    const [screenList, count] = await this.screenRepo.findAndCount({
      where,
      take: limit,
      skip,
      order: { id: 'DESC' },
      relations: ['roles'],
    });

    return { screenList, count };
  }

  async findOne(id: number) {
    const screen = await this.screenRepo.findOne({ 
      where: { id },
      relations: ['roles'],
    });
    
    if (!screen) {
      throw new NotFoundException(`Screen with id ${id} not found`);
    }
    
    return screen;
  }

  async update(id: number, dto: UpdateScreenDto) {
    const { role_ids, ...screenData } = dto;

    const screen = await this.screenRepo.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!screen) {
      throw new NotFoundException(`Screen with id ${id} not found`);
    }

    // Update basic fields
    Object.assign(screen, screenData);

    // Update roles if provided
    if (role_ids && role_ids.length > 0) {
      const roles = await this.roleRepo.findBy({
        id: In(role_ids),
      });

      if (roles.length !== role_ids.length) {
        const foundIds = roles.map(r => r.id);
        const missingIds = role_ids.filter(id => !foundIds.includes(id));
        throw new BadRequestException(
          `Role IDs not found: ${missingIds.join(', ')}`
        );
      }

      screen.roles = roles;
    }

    const updatedScreen = await this.screenRepo.save(screen);

    return await this.screenRepo.findOne({
      where: { id: updatedScreen.id },
      relations: ['roles'],
    });
  }

  async remove(id: number) {
    const screen = await this.screenRepo.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!screen) {
      throw new NotFoundException(`Screen with id ${id} not found`);
    }

    return await this.screenRepo.remove(screen);
  }
}