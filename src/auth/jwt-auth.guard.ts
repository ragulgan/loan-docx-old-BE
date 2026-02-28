import { CanActivate, ExecutionContext, UnauthorizedException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { extractTokenFromHeaders } from '../utill/utill';
import { AuthGuard } from '@nestjs/passport';
import * as _ from 'lodash';

export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
        const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined');
            }
      const decoded = jwt.verify(token, secret);
      if (_.isEmpty(decoded)) {
        throw new UnauthorizedException('Invalid token');
      }
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = extractTokenFromHeaders(req.headers);
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
        const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined');
            }
      const decoded: any = jwt.verify(token, secret);
      return decoded?.role?.role_name === 'Admin';
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}