import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { Role } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword({ minLength: 6 }, { message: 'Password is too weak' })
  password: string;

  @IsOptional()
  role?: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export type UserResponse = Omit<CreateUserDto, 'password'>;
