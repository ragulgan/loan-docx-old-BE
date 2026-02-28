import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Agent(AT)/Admin(AD)/Legal_team(LT)/Legal_head(LH)/Civil_team(CT)', default: 'AT' })
  @IsString()
  role_code: string;

  @ApiProperty()
  @IsString()
  role_name: string;

  @ApiProperty({ example: 'Y/N', default: 'Y' })
  @IsString()
  role_active: string;

}
