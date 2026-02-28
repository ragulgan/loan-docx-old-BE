import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UserLoginDto {
    @IsNotEmpty()
    @ApiProperty({
        example: 'admin@gmail.com',
        required: true
    })
    readonly email: string;

    @IsNotEmpty()
    @ApiProperty({
        example: 'Test@123',
        required: true
    })
    readonly password: string;
}