import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { throwError } from 'common/helpers/helpers';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { PaginationInfo, QueryParams } from 'common/types/type';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(req: Request, { content }: CreatePostDto) {
    try {
      if (!req.user)
        throw throwError('Authentication Error', HttpStatus.UNAUTHORIZED);

      const post = await this.prisma.post.create({
        data: {
          content,
          author: { connect: { id: req.user.id } },
        },
      });

      if (!post) throw throwError('Post not created', HttpStatus.BAD_REQUEST);

      return {
        message: 'Post created successfully',
        post,
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query?: QueryParams) {
    const { page = 1, limit = 10, search = '', sort } = query || {};
    try {
      const where: Prisma.PostWhereInput = {};
      const orderBy: Prisma.PostOrderByWithRelationInput = {};

      if (search) where.content = { contains: search, mode: 'insensitive' };

      if (sort) orderBy[sort] = 'desc';

      const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          select: {
            content: true,
            author: {
              select: {
                name: true,
                email: true,
                id: true,
                role: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          where,
          orderBy,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        this.prisma.post.count({ where }),
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

      if (!posts.length) {
        return {
          data: [],
          message: 'No posts found',
          success: true,
          pagination,
        };
      }

      return {
        data: posts,
        pagination,
        message: 'Users found',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async userPosts(id: string, query?: QueryParams) {
    const { page = 1, limit = 10, search = '', sort } = query || {};
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) throw throwError('User not found', HttpStatus.NOT_FOUND);

      const where: Prisma.PostWhereInput = {
        authorId: id,
      };
      const orderBy: Prisma.PostOrderByWithRelationInput = {};

      if (search) where.content = { contains: search, mode: 'insensitive' };

      if (sort) orderBy[sort] = 'desc';

      const [posts, totalCount] = await Promise.all([
        this.prisma.post.findMany({
          select: {
            content: true,
            author: {
              select: {
                name: true,
                email: true,
                id: true,
                role: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          where,
          orderBy,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        this.prisma.post.count({ where }),
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

      if (!posts.length) {
        return {
          data: [],
          message: 'No posts found',
          success: true,
          pagination,
        };
      }

      return {
        data: posts,
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
      const post = await this.prisma.post.findUnique({
        where: { id },
        select: {
          content: true,
          author: {
            select: {
              name: true,
              email: true,
              id: true,
              role: true,
            },
          },
        },
      });

      if (!post) throw throwError('Post not found', HttpStatus.NOT_FOUND);

      return {
        message: 'Post found',
        post,
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(req: Request, id: string, updatePostDto: UpdatePostDto) {
    try {
      if (!req.user)
        throw throwError('Authentication Error', HttpStatus.UNAUTHORIZED);

      const post = await this.prisma.post.findUnique({
        where: { id, authorId: req.user.id },
      });

      if (!post) throw throwError('Post not found', HttpStatus.NOT_FOUND);

      const updatedPost = await this.prisma.post.update({
        where: { id },
        data: {
          ...updatePostDto,
        },
      });

      if (!updatedPost)
        throw throwError('Post not updated', HttpStatus.BAD_REQUEST);

      return {
        message: 'Post updated successfully',
        post: updatedPost,
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(req: Request, id: string) {
    try {
      if (!req.user)
        throw throwError('Authentication Error', HttpStatus.UNAUTHORIZED);

      const post = await this.prisma.post.findUnique({
        where: { id, authorId: req.user.id },
      });

      if (!post) throw throwError('Post not found', HttpStatus.NOT_FOUND);

      await this.prisma.post.delete({ where: { id } });

      return {
        message: 'Post deleted successfully',
        success: true,
      };
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
