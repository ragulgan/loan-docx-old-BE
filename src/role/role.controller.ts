import { Controller, Get, Post, Body, Param, Patch, Delete, Res, BadRequestException, Query, Request, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseService } from '../base/controller';
import { appConst } from '../libs/constant';
import * as _ from 'lodash';
import { AdminGuard, JwtAuthGuard } from 'src/auth/jwt-auth.guard';
const { ERROR, SUCCESS } = appConst;

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(
    private readonly usersService: RoleService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post()
  @ApiResponse({ status: 200, description: 'Ok.',  
    schema: {
    example: {
      code: 0,
      messageCode: 0,
      data: {},
      message: 'string',
    }
  }})
  @ApiResponse({ status: 201, description: 'Created.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiResponse({ status: 404, description: 'Not Found.'})
  async create(@Body() dto: CreateRoleDto, @Res() res: Response) {
    try {
      const createdUser = await this.usersService.create(dto);
      if (createdUser) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1010',
          data: {
            user_id: (createdUser as any).user_id,
            created_at: (createdUser as any).created_at,
          }
        }, '1010');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1002' }, '1002');
      }
    } catch (e) {
      console.log('test============>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, })
  @ApiQuery({ name: 'limit', required: false, })
  @ApiQuery({ name: 'status', required: false, description: 'Return Based on status' })
  @Get()
  @ApiResponse({ status: 200, description: 'Ok.', 
    schema: {
    example: {
      code: 0,
      messageCode: 0,
      data: {},
      count: 0,
      message: 'string',
    }
  }})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiResponse({ status: 404, description: 'Not Found.'})
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getUser = await this.usersService.findAll(queryParams);
      if (!_.isEmpty(getUser)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1003',
          data: getUser.userList,
          count: getUser.count
        }, '1003');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getUser.userList.length }, '1004')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiResponse({ status: 200, description: 'Ok.', 
    schema: {
    example: {
      code: 0,
      messageCode: 0,
      data: {},
      message: 'string',
    }
  }})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiResponse({ status: 404, description: 'Not Found.'})
  async findOne(@Param('id') id: number, @Request() req, @Res() res: any) {
    try {
      const getUserById = await this.usersService.findOne(id)
      if (!_.isEmpty(getUserById)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1003',
          data: getUserById
        }, '1003');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1004' }, '1004');
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Ok.',  
    schema: {
    example: {
      code: 0,
      messageCode: 0,
      data: {},
      message: 'string',
    }
  }})
  @ApiResponse({ status: 201, description: 'Created.'})
  @ApiResponse({ status: 401, description: 'Unauthorized.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
  @ApiResponse({ status: 404, description: 'Not Found.'})
  async update(@Param('id') id: number, @Body() dto: UpdateRoleDto, @Res() res: any) {
    try {
      const updateUser = await this.usersService.update(id, dto);
      if (updateUser) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1011',
          data: {
            user_id: (updateUser as any).user_id,
            updated_at: (updateUser as any).updated_at,
          }
        }, '1011');
      } else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1002' }, '1002');
      }
    } catch (e) {
      console.log('test============>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Ok.',  
  schema: {
  example: {
    code: 0,
    messageCode: 0,
    message: 'string',
  }
}})
@ApiResponse({ status: 401, description: 'Unauthorized.'})
@ApiResponse({ status: 403, description: 'Forbidden.'})
@ApiResponse({ status: 404, description: 'Not Found.'})
  async remove(@Param('id') id: number, @Res() res: any) {
    try {
      const deletedUser = await this.usersService.remove(id);
      if (deletedUser) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1012', data: { _id: (deletedUser as any).id } }, '1012');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1002' }, '1002');
      }
    } catch {
      throw new BadRequestException();
    }
  }
}
