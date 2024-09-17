import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Post content is required' })
  content: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}
