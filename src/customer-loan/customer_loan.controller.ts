import { Controller, Get, Post, Body, Param, Patch, Delete, Res, BadRequestException, Query, Request, UseGuards } from '@nestjs/common';
import { CustomerLoanDetailService } from './customer_loan.service';
import { CreateCustomerLoanDetailsDto } from './dto/create-csloan.dto';
import { UpdateCustomerLoanDetailsDto } from './dto/update-csloan.dto';
import { ApiTags, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseService } from '../base/controller';
import { appConst } from '../libs/constant';
import * as _ from 'lodash';
import { AdminGuard, JwtAuthGuard, AgentGuard } from 'src/auth/jwt-auth.guard';
import { AdminApproveDto } from './dto/admin-approve.dto';
const { ERROR, SUCCESS } = appConst;

@ApiTags('customer-loan-details')
@Controller('customer-loan-details')
export class CustomerLoanDetailController {
  constructor(
    private readonly customerLoanDetailsService: CustomerLoanDetailService,
    private readonly responseService: ResponseService,
  ) { }

  @UseGuards(AgentGuard)
  @ApiBearerAuth()
  @Post('agent/loans/submit')
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
  async create(@Body() dto: CreateCustomerLoanDetailsDto, @Res() res: Response) {
    try {
      const createdCustomerLoanDetail = await this.customerLoanDetailsService.create(dto);
      if (createdCustomerLoanDetail) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1032',
          data: {
            customer_id: (createdCustomerLoanDetail as any).customer_id,
            creation_date: (createdCustomerLoanDetail as any).creation_date,
          }
        }, '1032');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1002' }, '1002');
      }
    } catch (e) {
      console.log('test============>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Post('admin/approve-transaction')
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
  async adminApproveLoanApp(@Body() dto: AdminApproveDto, @Res() res: Response) {
    try {
      const createdCustomerLoanDetail = await this.customerLoanDetailsService.adminApprove(dto);
      if (createdCustomerLoanDetail) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1038',
          data: {
            status: (createdCustomerLoanDetail as any).success,
            transactionId: (createdCustomerLoanDetail as any).transactionId,
          }
        }, '1038');
      }
      else {
        this.responseService.sendResponse({}, res, ERROR.CLIENT_ERROR.BAD_REQUEST, { code: '1002' }, '1002');
      }
    } catch (e) {
      console.log('test============>', e)
      throw new BadRequestException();
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get('admin/pending-approvals')
  @ApiResponse({
    status: 200, description: 'Ok.',
    schema: {
      example: {
        code: 0,
        messageCode: 0,
        data: {},
        count: 0,
        message: 'string',
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findAll(@Query() queryParams: { limit?: number; skip?: number }, @Res() res: any) {
    try {
      const getLoanCompany = await this.customerLoanDetailsService.findAll(queryParams);
      if (!_.isEmpty(getLoanCompany)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, {
          code: '1003',
          data: getLoanCompany.loanCompanyList,
          count: getLoanCompany.count
        }, '1003');
      }
      else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: [], count: getLoanCompany.loanCompanyList.length }, '1004')
      }
    } catch {
      throw new BadRequestException();
    }
  }

  @UseGuards(AgentGuard)
  @ApiBearerAuth()
  @Get('agent/loans/track/:query')
  @ApiResponse({
    status: 200, description: 'Ok.',
    schema: {
      example: {
        code: 0,
        messageCode: 0,
        data: {},
        message: 'string',
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async trackLoan(@Param('query') query: string, @Query('type') type: 'txn' | 'mobile', @Res() res: any) {
    try {
      const trackingData = await this.customerLoanDetailsService.trackLoan(query, type);
      if (!_.isEmpty(trackingData)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE,{
            code: '1003',
            status: (trackingData as any).success,
            data: (trackingData as any).data,
          }, '1003');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: null }, '1004');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('earnings/balance/:userId/:userType')
  @ApiResponse({
    status: 200, description: 'Ok.',
    schema: {
      example: {
        code: 0,
        messageCode: 0,
        data: {},
        message: 'string',
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async getBalanceLoan(@Param('userId') userId: string, @Param('userType') userType: 'AT' | 'LU' | 'LH' | 'CU', @Res() res: any) {
    try {
      const balanceCheckData = await this.customerLoanDetailsService.getBalance(userId, userType);
      if (!_.isEmpty(balanceCheckData)) {
        this.responseService.sendResponse({}, res, SUCCESS.CODE,{
            code: '1003',
            data: (balanceCheckData as any).data,
          }, '1003');
      } else {
        this.responseService.sendResponse({}, res, SUCCESS.CODE, { code: '1004', data: null }, '1004');
      }
    } catch (e) {
      throw new BadRequestException();
    }
  }
}