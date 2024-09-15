import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'common/decorators/roles.decorator';
import { Role } from 'common/types/type';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Unauthorized Access');
    console.log(token);
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET as string,
      })) as any;
      console.log(payload);

      // Fetch user from Prisma
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, email: true, name: true },
      });

      if (!user) throw new UnauthorizedException('Unauthorized Access');

      const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

      if (roles && !roles.includes(user.role as Role))
        throw new ForbiddenException('Forbidden Access');

      (request as any).user = user;

      return true;
    } catch (error) {
      console.error('Error verifying token:', error);
      throw new UnauthorizedException('Authentication Error');
    }
  }

  private extractToken(request: Request): string | null {
    let token = '';
    if (request.cookies?.token) {
      token = request.cookies.token;
    }

    const authorization = request.headers['authorization'];
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.replace('Bearer ', '');
    }

    return token;
  }
}
