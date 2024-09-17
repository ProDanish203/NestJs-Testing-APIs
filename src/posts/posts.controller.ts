import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import { Request } from 'express';
import { QueryParams } from 'common/types/type';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(
    @Req() req: Request,
    @Body(ValidationPipe) createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(req, createPostDto);
  }

  @Get()
  findAll(@Query() query: QueryParams) {
    return this.postsService.findAll(query);
  }

  @Get('user/:id')
  userPosts(@Param('id') id: string, @Query() query: QueryParams) {
    return this.postsService.userPosts(id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(req, id, updatePostDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.postsService.remove(req, id);
  }
}
