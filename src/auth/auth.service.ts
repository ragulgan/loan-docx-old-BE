import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { User } from "../users/users.entity";
import { UserLoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private readonly userService: UsersService,
    ) { }

    decodeToken(token: string): any {
        try {
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined');
            }
            const decoded = jwt.verify(token, secret);
            return decoded;
        } catch (error) {
            return null;
        }
    }

    async validateUser(mobileNumber: string, createUserDto): Promise<User> {
        const result = await this.userService.findAll(mobileNumber);
        const user = result.userList[0];
        if (!user) {
            throw new NotAcceptableException('Could not find the user');
        }
        return user;
    }

    async validateUserByEmail(email: string): Promise<User> {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotAcceptableException('Could not find the user');
        }
        return user;
    }

    async userLogin(createUserDto: UserLoginDto) {
        const result = await this.userService.userLogin(createUserDto);
        if (!result) return false;
        const payload = await this.userGeneratePayload(result);
        return {
            user: result,
            token: this.jwtService.sign(payload)
        };
    }

    async userGeneratePayload(userData: any) {
        return {
            id: userData.id,
            user_id: userData.user_id,
            user_name: userData.user_name,
            mobile_number: userData.mobile_number,
            email_id: userData.email_id,
            role: {
                id: userData.role.id,
                role_code: userData.role.role_code,
                role_name: userData.role.role_name,
                role_active: userData.role.role_active,
            },
        }
    }
}