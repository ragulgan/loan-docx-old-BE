import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenService } from './screen.service';
import { ScreenController } from './screen.controller';
import { Screen } from './screen.entity';
import { ResponseService } from '../base/controller';
import { Role } from 'src/role/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Screen, Role])],
  controllers: [ScreenController],
  providers: [ScreenService, ResponseService],
  exports: [ScreenService],
})
export class ScreenModule {}
