import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, LoginDto } from './dto/user.dto';
import { PrismaService } from 'src/prisma.service';
import { throwError } from '../../common/helpers/helpers';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register({ email, name, password, role }: CreateUserDto) {
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
      });

      if (!user) throw throwError('User not created', HttpStatus.BAD_REQUEST);

      return user;
    } catch (error) {
      throw throwError(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async login(loginDto: LoginDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
