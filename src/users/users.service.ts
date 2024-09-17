import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { throwError } from '../../common/helpers/helpers';
import e, { Request } from 'express';
import { PaginationInfo, QueryParams } from 'common/types/type';
import { Prisma } from '@prisma/client';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: QueryParams) {
    const { page = 1, limit = 10, search = '', filter, sort } = query || {};
    try {
      const where: Prisma.UserWhereInput = {};
      const orderBy: Prisma.UserOrderByWithRelationInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (filter) orderBy.name = filter === 'atoz' ? 'asc' : 'desc';
      if (sort) orderBy[sort] = 'desc';

      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          select: {
            email: true,
            id: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      const pagination: PaginationInfo = {
        totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };

      if (!users.length) {
        return {
          data: [],
          message: 'No users found',
          success: true,
          pagination,
        };
      }

      return {
        data: users,
        pagination,
        message: 'Users found',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
        },
      });

      if (!user) throw throwError('User not found', HttpStatus.NOT_FOUND);

      return {
        data: user,
        message: 'User found',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async currentUser(request: Request) {
    try {
      if (!request.user)
        throw throwError('User not found', HttpStatus.NOT_FOUND);

      const user = await this.prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
        },
      });

      if (!user) throw throwError('User not found', HttpStatus.NOT_FOUND);

      return {
        data: user,
        message: 'Current User',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async profile(request: Request) {
    try {
      if (!request.user)
        throw throwError('User not found', HttpStatus.NOT_FOUND);

      const user = await this.prisma.user.findUnique({
        where: {
          id: request.user.id,
        },
        select: {
          email: true,
          id: true,
          name: true,
          role: true,
        },
      });

      if (!user) throw throwError('User not found', HttpStatus.NOT_FOUND);

      return {
        data: user,
        message: "User's profile",
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(request: Request, updateUserDto: UpdateUserDto) {
    try {
      if (!request.user)
        throw throwError('User not found', HttpStatus.NOT_FOUND);

      const user = await this.prisma.user.update({
        where: {
          id: request.user.id,
        },
        data: {
          ...updateUserDto,
        },
      });

      if (!user) throw throwError('User not found', HttpStatus.NOT_FOUND);

      return {
        data: user,
        message: 'User updated',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(request: Request) {
    try {
      if (!request.user)
        throw throwError('User not found', HttpStatus.NOT_FOUND);

      await this.prisma.user.delete({
        where: {
          id: request.user.id,
        },
      });

      return {
        message: 'User deleted',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
