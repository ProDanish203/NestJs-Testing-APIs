import { HttpStatus, Injectable } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { throwError } from 'common/helpers/helpers';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register({ email, name, password, role }: RegisterDto) {
    try {
      const checkExistinUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (checkExistinUser)
        throw throwError('User already exists', HttpStatus.CONFLICT);

      // Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
        },
        select: {
          password: false,
          email: true,
          id: true,
          name: true,
          role: true,
        },
      });

      if (!user) throw throwError('User not created', HttpStatus.BAD_REQUEST);

      return user;
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async login(response: Response, { email, password }: LoginDto) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!userExists) throwError('Invalid Credentials', HttpStatus.NOT_FOUND);

      const isPasswordMatch = await bcrypt.compare(
        password,
        userExists.password,
      );
      if (!isPasswordMatch)
        throwError('Invalid Credentials', HttpStatus.NOT_FOUND);

      // Return user without password
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: false,
          role: true,
        },
      });

      // Generate JWT Token
      const payload = { email: user.email, sub: user.id, role: user.role };
      const token = await this.jwtService.signAsync(payload);

      const cookieOptions = {
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: 'none' as 'none',
        httpOnly: true,
        secure: true,
      };

      response.cookie('token', token, cookieOptions);

      return { user, token };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async logout(response: Response) {
    try {
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
